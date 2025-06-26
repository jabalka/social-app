// hooks/use-postcode-address.hook.ts
import { getPostcodeData } from "@/utils/postcode.utils";
import { useState } from "react";

export function usePostcodeAddress() {
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [addressLines, setAddressLines] = useState<string[]>([]);
  const [addressCoords, setAddressCoords] = useState<string>("");
  const [postcode, setPostcode] = useState<string>("");
  const [what3words, setWhat3words] = useState<string>("");

  // By postcode
  const updateByPostcode = async (value: string) => {
    if (value.length < 5) {
      resetAddressState();
      return;
    }
    const data = await getPostcodeData({ postcode: value });
    if (data) {
      setLat(data.lat);
      setLng(data.lng);
      setAddressLines(data.addressLines);
      setAddressCoords(data.addressCoords);
      setPostcode(data.postcode);
      setWhat3words(data.what3words || "");
      return data;
    } else {
      resetAddressState();
      return null;
    }
  };

  // By map (lat/lng)
  const updateByLatLng = async (lat: number, lng: number) => {
    const data = await getPostcodeData({ lat, lng });
    if (data) {
      setLat(data.lat);
      setLng(data.lng);
      setAddressLines(data.addressLines);
      setAddressCoords(data.addressCoords);
      setPostcode(data.postcode);
      setWhat3words(data.what3words || "");
      return data; 
    } else {
      resetAddressState();
      return null;
    }
  };

  const setAllAddressState = (
    lat: number | null,
    lng: number | null,
    addressLines: string[],
    addressCoords: string,
    postcode: string,
    what3words: string,
  ) => {
    setLat(lat);
    setLng(lng);
    setAddressLines(addressLines);
    setAddressCoords(addressCoords);
    setPostcode(postcode);
    setWhat3words(what3words);
  };

  const resetAddressState = () => {
    setLat(null);
    setLng(null);
    setAddressLines([]);
    setAddressCoords("");
    setPostcode("");
    setWhat3words("");
  };

  return {
    lat,
    lng,
    addressLines,
    addressCoords,
    postcode,
    what3words,
    updateByPostcode,
    updateByLatLng,
    setAllAddressState,
    resetAddressState,
  };
}
