import { useState } from "react";
import { MapPin, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface Place {
  id: number;
  name: string;
  address: string;
  lat: number;
  lon: number;
}

interface PlaceSearchResultProps {
  results: Place[];
  onSelect: (place: Place, type: "start" | "end") => void;
  onClose: () => void;
}

const PlaceSearchResult = ({ results, onSelect, onClose }: PlaceSearchResultProps) => {
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);

  if (selectedPlace) {
    return (
      <div className="absolute top-full left-0 right-0 z-20 bg-background border-t shadow-lg">
        <Card className="m-2 p-4">
          <div className="flex items-start gap-3 mb-4">
            <MapPin className="h-6 w-6 text-primary mt-1 shrink-0" />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg mb-1">{selectedPlace.name}</h3>
              <p className="text-sm text-muted-foreground">{selectedPlace.address}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="default"
              className="flex-1"
              onClick={() => {
                onSelect(selectedPlace, "start");
                setSelectedPlace(null);
              }}
            >
              출발
            </Button>
            <Button
              variant="default"
              size="default"
              className="flex-1"
              onClick={() => {
                onSelect(selectedPlace, "end");
                setSelectedPlace(null);
              }}
            >
              도착
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full mt-2"
            onClick={() => setSelectedPlace(null)}
          >
            다른 장소 선택
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="absolute top-full left-0 right-0 z-20 bg-background border-t shadow-lg max-h-96 overflow-y-auto">
      {results.map((place) => (
        <Card
          key={place.id}
          className="m-2 p-3 hover:bg-muted/50 transition-colors cursor-pointer"
          onClick={() => setSelectedPlace(place)}
        >
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-primary mt-1 shrink-0" />
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-base truncate">{place.name}</h3>
              <p className="text-sm text-muted-foreground truncate">{place.address}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default PlaceSearchResult;
