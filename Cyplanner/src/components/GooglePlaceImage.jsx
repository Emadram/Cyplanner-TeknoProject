import React, { useEffect, useState } from "react";

const GooglePlaceImage = ({ placeName, lat, lng, apiKey, onImageFound, fallbackImage }) => {
  const [imageUrl, setImageUrl] = useState(fallbackImage);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlaceImage = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const searchResponse = await fetch(
          `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=500&keyword=${encodeURIComponent(placeName)}&key=${apiKey}`
        );

        if (!searchResponse.ok) {
          throw new Error("Failed to fetch place data");
        }

        const searchData = await searchResponse.json();
        
        if (searchData.results.length === 0 || !searchData.results[0].photos) {
          setImageUrl(fallbackImage);
          setIsLoading(false);
          return;
        }

        // Get the photo reference from the first result
        const photoReference = searchData.results[0].photos[0].photo_reference;

        // Use the photo reference to get the actual image
        const imageUrlFromGoogle = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoReference}&key=${apiKey}`;
        
        setImageUrl(imageUrlFromGoogle);
        
        // Notify parent component that we found an image
        if (onImageFound) {
          onImageFound(imageUrlFromGoogle);
        }
      } catch (err) {
        console.error("Error fetching Google Place image:", err);
        setError(err.message);
        setImageUrl(fallbackImage);
      } finally {
        setIsLoading(false);
      }
    };

    // Only try to fetch if we have the necessary data
    if (placeName && lat && lng && apiKey) {
      fetchPlaceImage();
    } else {
      setImageUrl(fallbackImage);
      setIsLoading(false);
    }
  }, [placeName, lat, lng, apiKey, fallbackImage, onImageFound]);

  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}
      <img
        src={imageUrl}
        alt={placeName || "Place image"}
        className="w-full h-40 object-cover rounded-xl mb-2"
        onError={() => {
          setImageUrl(fallbackImage);
          setError("Failed to load image");
        }}
      />
      {error && <div className="text-xs text-red-500 mt-1">Using fallback image</div>}
    </div>
  );
};

export default GooglePlaceImage;