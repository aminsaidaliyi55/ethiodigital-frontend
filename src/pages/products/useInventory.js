import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import {
    getProducts, getCategories, getShops,
    createProduct, updateProduct, deleteProduct,
    createOrder
} from "./ProductService";

export const useInventory = () => {
    const [data, setData] = useState([]);
    const [categories, setCategories] = useState([]);
    const [shops, setShops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [modal, setModal] = useState({ isOpen: false, type: null, data: null });

    const initialFormValues = {
        name: "",
        slug: "",
        buying_price: 0,
        selling_price: 0,
        stock_quantity: 0,
        category_id: "",
        shop_id: "",
        image: null,
        description: "",
        size: "",
        color_name: "",
        order_qty: 1
    };

    const [formValues, setFormValues] = useState(initialFormValues);

    const generateUniqueCode = () => {
        const prefix = "TRX";
        const randomDigits = Math.floor(100000000000 + Math.random() * 900000000000);
        return `${prefix}-${randomDigits}`;
    };

    const extractArray = (res) => {
        if (!res) return [];
        if (Array.isArray(res)) return res;
        if (res.data && Array.isArray(res.data)) return res.data;
        return [];
    };

    const enrichProduct = useCallback((product, currentShops, currentCategories) => {
        if (!product) return null;
        const matchedShop = currentShops.find(s => String(s.id) === String(product.shop_id));
        const matchedCat = currentCategories.find(c => String(c.id) === String(product.category_id));

        return {
            ...product,
            category_name: matchedCat?.name || "General Asset",
            shop_name: matchedShop?.name || "Unassigned Store"
        };
    }, []);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [p, c, s] = await Promise.all([
                getProducts(),
                getCategories(),
                getShops()
            ]);

            const fetchedProducts = extractArray(p);
            const fetchedCategories = extractArray(c);
            const fetchedShops = extractArray(s);

            const enrichedProducts = fetchedProducts.map(prod =>
                enrichProduct(prod, fetchedShops, fetchedCategories)
            );

            setData(enrichedProducts);
            setCategories(fetchedCategories);
            setShops(fetchedShops);
        } catch (err) {
            toast.error("Failed to sync Registry data");
        } finally {
            setLoading(false);
        }
    }, [enrichProduct]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const calculateGrandTotal = () => {
        if (formValues?.is_batch) {
            return formValues.items.reduce((sum, item) => sum + (Number(item.order_qty) * Number(item.selling_price)), 0);
        }
        return Number(formValues?.order_qty || 1) * Number(formValues?.selling_price || 0);
    };

    const handleAction = async () => {
        setSubmitting(true);
        try {
            if (modal.type === "delete") {
                await deleteProduct(modal.data.id);
                toast.success("Asset purged from registry");
            }
            else if (modal.type === "order") {
                const transactionCode = generateUniqueCode();

                const orderPayload = {
                    total_amount: calculateGrandTotal(),
                    payment_method: "CASH / TRANSFER",
                    transaction_id: transactionCode,
                    items: formValues.is_batch
                        ? formValues.items.map(item => ({
                            id: item.id,
                            shop_id: item.shop_id,
                            order_qty: item.order_qty,
                            selling_price: item.selling_price,
                            unique_ref: transactionCode
                        }))
                        : [{
                            id: formValues.id,
                            shop_id: formValues.shop_id,
                            order_qty: formValues.order_qty,
                            selling_price: formValues.selling_price,
                            unique_ref: transactionCode
                        }]
                };

                await createOrder(orderPayload);

                // Using plain text to avoid Vite parsing errors in .js files
                toast.success(`Order Confirmed! Ref: ${transactionCode}`, {
                    duration: 600000,
                    icon: '🎉',
                });
            }
            else if (modal.type === "create" || modal.type === "edit") {
                const formData = new FormData();
                Object.keys(formValues).forEach(key => {
                    if (key === 'image' && formValues[key] instanceof File) {
                        formData.append('image', formValues[key]);
                    } else if (formValues[key] !== null && formValues[key] !== undefined) {
                        formData.append(key, formValues[key]);
                    }
                });

                if (modal.type === "create") {
                    await createProduct(formData);
                    toast.success("Registry successfully updated");
                } else {
                    await updateProduct(modal.data.id, formData);
                    toast.success("Asset details updated");
                }
            }

            setModal({ isOpen: false, type: null, data: null });
            await loadData();
        } catch (err) {
            const errorMsg = err.response?.data?.detail || err.response?.data?.error || "Operation failed";
            toast.error(errorMsg);
        } finally {
            setSubmitting(false);
        }
    };

    const openModal = (type, item = null) => {
        if (item) {
            if (item.is_batch) {
                setFormValues({
                    ...item,
                    items: item.items.map(i => ({ ...i, order_qty: i.order_qty || 1 }))
                });
            } else {
                setFormValues({
                    id: item.id,
                    name: item.name || "",
                    slug: item.slug || "",
                    buying_price: item.buying_price || 0,
                    selling_price: item.selling_price || 0,
                    stock_quantity: item.stock_quantity || 0,
                    category_id: item.category_id || "",
                    shop_id: item.shop_id || "",
                    image: item.image || null,
                    description: item.description || "",
                    size: item.size || "",
                    color_name: item.color_name || "",
                    order_qty: item.order_qty || 1,
                });
            }
            setModal({ isOpen: true, type, data: item });
        } else {
            setFormValues(initialFormValues);
            setModal({ isOpen: true, type, data: null });
        }
    };

    return {
        data, categories, shops, loading, submitting,
        modal, setModal, formValues, setFormValues,
        handleAction, openModal, loadData, calculateGrandTotal
    };
};