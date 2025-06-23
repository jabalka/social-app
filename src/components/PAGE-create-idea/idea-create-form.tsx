// components/PAGE-create-idea/idea-create-form.tsx
"use client";
import React, { useState } from "react";

import axios from "axios";
import LeafletMapModal  from "../leaflet-map-modal";

const what3wordsApiKey = process.env.NEXT_PUBLIC_W3W_API_KEY!;

export interface IdeaCreateFormProps {
  open?: boolean;
  onClose?: () => void;
  onIdeaCreated?: () => void;
}

export const IdeaCreateForm: React.FC<IdeaCreateFormProps> = ({
  open = true,
  onClose,
  onIdeaCreated,
}) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [allowCollab, setAllowCollab] = useState(true);
  const [loading, setLoading] = useState(false);

  // Location state
  const [postcode, setPostcode] = useState("");
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [what3words, setWhat3words] = useState("");
  const [showMap, setShowMap] = useState(false);
  const [address, setAddress] = useState(""); // human-friendly

  // Handle postcode entry
  const handlePostcodeChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    setPostcode(value);
    if (value.length >= 5) {
      try {
        const res = await axios.get(
          `https://api.postcodes.io/postcodes/${value}`
        );
        const { latitude, longitude, admin_district, admin_ward, country } =
          res.data.result;
        setLat(latitude);
        setLng(longitude);
        setAddress(`${admin_ward}, ${admin_district}, ${country}`);
        // Get W3W in background
        const w3wRes = await fetch(
          `https://api.what3words.com/v3/convert-to-3wa?coordinates=${latitude},${longitude}&key=${what3wordsApiKey}`
        );
        const w3wData = await w3wRes.json();
        setWhat3words(w3wData.words || "");
      } catch (err) {
        setAddress("");
        setLat(null);
        setLng(null);
        setWhat3words("");
        console.log(err)
      }
    }
  };

  const handleMapPick = async (lat: number, lng: number) => {
    setLat(lat);
    setLng(lng);
    setShowMap(false);
  
    // Get what3words in background
    try {
      const w3wRes = await fetch(
        `https://api.what3words.com/v3/convert-to-3wa?coordinates=${lat},${lng}&key=${what3wordsApiKey}`
      );
      const w3wData = await w3wRes.json();
      setWhat3words(w3wData.words || "");
    } catch {}
  
    // Optionally, get postcode/address via postcodes.io
    try {
      const res = await axios.get(
        `https://api.postcodes.io/postcodes?lon=${lng}&lat=${lat}`
      );
      const pc = res.data.result?.[0]?.postcode;
      setPostcode(pc || "");
      setAddress(
        res.data.result?.[0]
          ? `${res.data.result[0].admin_ward}, ${res.data.result[0].admin_district}, ${res.data.result[0].country}`
          : ""
      );
    } catch {
      setPostcode("");
      setAddress("");
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/ideas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        content,
        allowCollab,
        latitude: lat,
        longitude: lng,
        postcode,
        what3words,
      }),
    });
    setLoading(false);
    if (res.ok) {
      setTitle("");
      setContent("");
      setAllowCollab(true);
      setLat(null);
      setLng(null);
      setPostcode("");
      setWhat3words("");
      setAddress("");
      onIdeaCreated?.();
      onClose?.();
    }
  };

  if (!open) return null;

  return (
    <>
      <form
        onSubmit={submit}
        className="bg-white rounded-xl shadow p-6 space-y-4"
      >
        <input
          className="w-full border p-2 rounded"
          placeholder="Idea title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          className="w-full border p-2 rounded"
          placeholder="Describe your idea..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={5}
          required
        />
        <div>
          <div className="flex gap-2 items-center mb-2">
            <input
              className="w-full border p-2 rounded"
              placeholder="Enter UK postcode (auto-fills location)"
              value={postcode}
              onChange={handlePostcodeChange}
            />
            <button
              type="button"
              onClick={() => setShowMap(true)}
              className="rounded bg-blue-500 px-3 py-2 text-white"
            >
              Pick on Map
            </button>
          </div>
          {address && (
            <div className="text-xs text-gray-600">Address: {address}</div>
          )}
          {lat && lng && (
            <div className="text-xs text-gray-600">
              Coordinates: {lat}, {lng}
            </div>
          )}
        </div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={allowCollab}
            onChange={(e) => setAllowCollab(e.target.checked)}
          />
          Allow collaboration requests
        </label>
        <div className="flex gap-2">
          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            disabled={loading}
          >
            {loading ? "Submitting..." : "Share Idea"}
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
      <LeafletMapModal
  open={showMap}
  onPick={handleMapPick}
  onClose={() => setShowMap(false)}
  defaultPosition={lat && lng ? [lat, lng] : [51.505, -0.09]}
/>
    </>
  );
};

export default IdeaCreateForm;
