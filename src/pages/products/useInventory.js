"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import toast from "react-hot-toast";

import {
    getProducts,
    createProduct,
    updateProduct,
    deleteProduct as deleteProductService,
    getShops,
    getCategories,
} from "@/services/inventoryService";

export const useInventory = () => {
    /* ---------- State ---------- */
    const [allProducts, setAllProducts] = useState([]);
    const [shops, setShops] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const [modal, setModal] = useState({
        isOpen: false,
        type: null, // "view" | "edit" | "create"
        data: null,
    });

    const initialFormState = {
        shop_id: "",
        category_id: "",
        name: "",
        sku: "",
        image: "",
        stock_quantity: 0,
        selling_price: 0,
        price: 0,
        description: "",
    };
    const [formValues, setFormValues] = useState(initialFormState);

    /* ---------- Data loading ---------- */
    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [p, s, c] = await Promise.all([
                getProducts(),
                getShops(),
                getCategories(),
            ]);

            const mappedProducts = Array.isArray(p)
                ? p.map((item) => ({
                    ...item,
                    id: item.id ?? item.Id,
                    name: item.name ?? item.Name ?? "Unnamed Product",
                    sku: item.sku ?? item.Sku ?? "---",
                    category_id: item.category_id ?? item.Category_id,
                    shop_id: item.shop_id ?? item.Shop_id,
                    stock_quantity: Number(
                        item.stock_quantity ?? item.Stock_quantity ?? 0
                    ),
                    selling_price: Number(
                        item.selling_price ?? item.Selling_price ?? 0
                    ),
                    price: Number(item.price ?? item.Price ?? 0),
                    description: item.description ?? item.Description ?? "",
                }))
                : [];

            setAllProducts(mappedProducts);
            setShops(Array.isArray(s) ? s : []);
            setCategories(Array.isArray(c) ? c : []);
        } catch (err) {
            console.error(err);
            toast.error("Registry Sync Failed");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadData();
    }, [loadData]);

    /* ---------- Sync form when modal opens (edit / view) ---------- */
    useEffect(() => {
        if (modal.data && (modal.type === "edit" || modal.type === "view")) {
            const d = modal.data;
            setFormValues({
                shop_id: d.shop_id ?? "",
                category_id: d.category_id ?? "",
                name: d.name ?? "",
                sku: d.sku ?? "",
                image: d.image ?? "",
                stock_quantity: d.stock_quantity ?? 0,
                selling_price: d.selling_price ?? 0,
                price: d.price ?? 0,
                description: d.description ?? "",
            });
        } else {
            setFormValues(initialFormState);
        }
    }, [modal]);

    /* ---------- Filtering & Pagination ---------- */
    const filteredProducts = useMemo(() => {
        const term = search.toLowerCase();
        return allProducts.filter(
            (p) =>
                p.name?.toLowerCase().includes(term) ||
                p.sku?.toLowerCase().includes(term)
        );
    }, [allProducts, search]);

    const totalCount = filteredProducts.length;
    const totalPages = Math.ceil(totalCount / itemsPerPage) || 1;

    const paginatedProducts = filteredProducts.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    /* ---------- CRUD actions ---------- */
    const handleDelete = async (id) => {
        const toastId = toast.loading("Purging record...");
        try {
            await deleteProductService(id);
            toast.success("Record deleted", { id: toastId });
            await loadData();
        } catch (err) {
            toast.error(err?.response?.data?.message ?? "Delete failed", {
                id: toastId,
            });
        }
    };

    const handleAction = async (e) => {
        e?.preventDefault();
        setSubmitting(true);
        const toastId = toast.loading("Processing...");

        try {
            const productId = modal.data?.id ?? modal.data?.Id;

            if (modal.type === "edit" && productId) {
                await updateProduct(productId, formValues);
            } else {
                await createProduct(formValues);
            }

            toast.success("Registry Updated", { id: toastId });
            setModal({ isOpen: false, type: null, data: null });
            await loadData();
        } catch (err) {
            toast.error("Process failed", { id: toastId });
        } finally {
            setSubmitting(false);
        }
    };

    return {
        // Data
        products: paginatedProducts,
        totalCount,
        shops,
        categories,
        loading,
        submitting,

        // UI state
        modal,
        setModal,
        formValues,
        setFormValues,
        search,
        setSearch,
        currentPage,
        setCurrentPage,
        totalPages,

        // Handlers
        handleAction,
        handleDelete,
        loadData,
        initialFormState,
    };
};