// src/pages/Surveys/hooks/useAudience.js
// ============================================================================
// Custom hook for managing audience segments, contact categories,
// custom contact selection, and related state.
// Extracted from SurveyBuilder.jsx audience management functions.
// ============================================================================

import { useState, useCallback, useEffect, useRef } from 'react';
import axiosInstance from '../../../api/axiosInstance';

const CONTACT_PAGE_LIMIT = 10;
const DEBOUNCE_DELAY = 300; // ms

const useAudience = ({ user, isTemplateMode }) => {
    // Audience state
    const [targetAudience, setTargetAudience] = useState([]);
    const [audienceSegments, setAudienceSegments] = useState([]);
    const [contactCategories, setContactCategories] = useState([]);
    const [loadingSegments, setLoadingSegments] = useState(false);
    const [loadingCategories, setLoadingCategories] = useState(false);

    // Contact modal state
    const [contacts, setContacts] = useState([]);
    const [selectedContacts, setSelectedContacts] = useState([]);
    const [showCustomContactModal, setShowCustomContactModal] = useState(false);
    const [loadingContacts, setLoadingContacts] = useState(false);
    const [contactSearch, setContactSearch] = useState('');
    const [contactPage, setContactPage] = useState(1);
    const [contactTotal, setContactTotal] = useState(0);

    // Debounce timer ref
    const searchTimerRef = useRef(null);

    // AbortController refs for async cleanup
    const segmentsAbortRef = useRef(null);
    const categoriesAbortRef = useRef(null);
    const contactsAbortRef = useRef(null);

    // ── Fetch audience segments ──────────────────────────────────────
    const fetchAudienceSegments = useCallback(async () => {
        // Abort any in-flight request
        if (segmentsAbortRef.current) segmentsAbortRef.current.abort();
        segmentsAbortRef.current = new AbortController();

        try {
            setLoadingSegments(true);
            const response = await axiosInstance.get('/segments?withCounts=true', {
                signal: segmentsAbortRef.current.signal
            });

            if (response.data?.success && Array.isArray(response.data?.data?.segments)) {
                const segmentsWithContacts = response.data.data.segments.filter(
                    (seg) => (seg.contactCount || 0) > 0
                );
                setAudienceSegments(segmentsWithContacts);
            } else {
                setAudienceSegments([]);
            }
        } catch (error) {
            if (error.name === 'CanceledError' || error.name === 'AbortError') return;
            console.error('Error fetching audience segments:', error);
            setAudienceSegments([]);
        } finally {
            setLoadingSegments(false);
        }
    }, []);

    // ── Fetch contact categories ─────────────────────────────────────
    const fetchContactCategories = useCallback(async () => {
        if (categoriesAbortRef.current) categoriesAbortRef.current.abort();
        categoriesAbortRef.current = new AbortController();

        try {
            setLoadingCategories(true);
            const response = await axiosInstance.get('/contact-categories', {
                signal: categoriesAbortRef.current.signal
            });

            if (response.data?.success && Array.isArray(response.data?.data?.categories)) {
                const categoriesWithContacts = response.data.data.categories.filter(
                    (cat) => (cat.contactCount || 0) > 0
                );
                setContactCategories(categoriesWithContacts);
            } else {
                setContactCategories([]);
            }
        } catch (error) {
            if (error.name === 'CanceledError' || error.name === 'AbortError') return;
            console.error('Error fetching contact categories:', error);
            setContactCategories([]);
        } finally {
            setLoadingCategories(false);
        }
    }, []);

    // ── Fetch contacts (paginated) ───────────────────────────────────
    const fetchContacts = useCallback(async (page = 1, search = '') => {
        if (contactsAbortRef.current) contactsAbortRef.current.abort();
        contactsAbortRef.current = new AbortController();

        try {
            setLoadingContacts(true);
            const { data } = await axiosInstance.get('/contacts', {
                params: { page, limit: CONTACT_PAGE_LIMIT, search },
                signal: contactsAbortRef.current.signal
            });

            const contactsData = data?.data?.contacts || data?.contacts || [];
            const totalCount = data?.data?.total ?? data?.total ?? 0;

            setContacts(Array.isArray(contactsData) ? contactsData : []);
            setContactTotal(Number(totalCount));
            setContactPage(page);
        } catch (error) {
            if (error.name === 'CanceledError' || error.name === 'AbortError') return;
            console.error('Error fetching contacts:', error);
        } finally {
            setLoadingContacts(false);
        }
    }, []);

    // ── Load segments & categories on mount ──────────────────────────
    useEffect(() => {
        if (user && !isTemplateMode) {
            fetchAudienceSegments();
            fetchContactCategories();
        }
    }, [user, isTemplateMode, fetchAudienceSegments, fetchContactCategories]);

    // ── Toggle audience selection ────────────────────────────────────
    const toggleAudience = useCallback((audienceId) => {
        if (audienceId === 'custom') {
            setShowCustomContactModal(true);
            fetchContacts(1, '');
            return;
        }
        setTargetAudience(prev =>
            prev.includes(audienceId)
                ? prev.filter(id => id !== audienceId)
                : [...prev, audienceId]
        );
    }, [fetchContacts]);

    // ── Toggle contact selection ─────────────────────────────────────
    const toggleContactSelection = useCallback((contactId) => {
        setSelectedContacts(prev =>
            prev.includes(contactId)
                ? prev.filter(id => id !== contactId)
                : [...prev, contactId]
        );
    }, []);

    // ── Save selected contacts ──────────────────────────────────────
    const saveSelectedContacts = useCallback(() => {
        if (selectedContacts.length > 0) {
            setTargetAudience(prev =>
                prev.includes('custom') ? prev : [...prev, 'custom']
            );
        }
        setShowCustomContactModal(false);
    }, [selectedContacts]);

    // ── Search contacts (debounced) ──────────────────────────────────
    const handleContactSearch = useCallback((searchTerm) => {
        setContactSearch(searchTerm);
        setContactPage(1);

        // Debounce the actual API call
        if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
        searchTimerRef.current = setTimeout(() => {
            fetchContacts(1, searchTerm);
        }, DEBOUNCE_DELAY);
    }, [fetchContacts]);

    // ── Page change ─────────────────────────────────────────────────
    const handleContactPageChange = useCallback((newPage) => {
        fetchContacts(newPage, contactSearch);
    }, [fetchContacts, contactSearch]);

    // Cleanup debounce timer and abort controllers on unmount
    useEffect(() => {
        return () => {
            if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
            if (segmentsAbortRef.current) segmentsAbortRef.current.abort();
            if (categoriesAbortRef.current) categoriesAbortRef.current.abort();
            if (contactsAbortRef.current) contactsAbortRef.current.abort();
        };
    }, []);

    return {
        // Audience state
        targetAudience,
        setTargetAudience,
        audienceSegments,
        contactCategories,
        loadingSegments,
        loadingCategories,

        // Contact state
        contacts,
        selectedContacts,
        setSelectedContacts,
        showCustomContactModal,
        setShowCustomContactModal,
        loadingContacts,
        contactSearch,
        contactPage,
        contactTotal,
        contactLimit: CONTACT_PAGE_LIMIT,

        // Actions
        toggleAudience,
        toggleContactSelection,
        saveSelectedContacts,
        handleContactSearch,
        handleContactPageChange,
        fetchAudienceSegments,
        fetchContactCategories,
        fetchContacts
    };
};

export default useAudience;
