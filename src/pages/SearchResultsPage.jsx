import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import DealCard from "../components/dealCard";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function SearchResultsPage({ requireAuth }) {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const query = useQuery().get("q") || "";

  useEffect(() => {
    async function fetchDeals() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("https://capstone-deals-app-endpoints.vercel.app/deals");
        if (!res.ok) throw new Error("Failed to fetch deals");
        let data = await res.json();
        // Filter deals by query
        const q = query.trim().toLowerCase();
        data = data.filter(deal =>
          (deal.title && deal.title.toLowerCase().includes(q)) ||
          (deal.description && deal.description.toLowerCase().includes(q)) ||
          (deal.username && deal.username.toLowerCase().includes(q))
        );
        setDeals(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    if (query) fetchDeals();
  }, [query]);

  return (
    <div className="container">
      <h2>Search Results for "{query}"</h2>
      {loading && <div>Loading...</div>}
      {error && <div className="text-danger">{error}</div>}
      {!loading && !error && deals.length === 0 && <div>No deals found.</div>}
      {!loading && !error && deals.map(deal => (
        <DealCard key={deal.deal_id} {...deal} requireAuth={requireAuth} />
      ))}
    </div>
  );
}