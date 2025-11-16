import { useState, useEffect } from "react";
import { X, Star, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PlaceReviewModalProps {
  open: boolean;
  onClose: () => void;
  place: {
    name: string;
    lat: number;
    lon: number;
  } | null;
}

const PlaceReviewModal = ({ open, onClose, place }: PlaceReviewModalProps) => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [newReview, setNewReview] = useState("");
  const [accessibilityLevel, setAccessibilityLevel] = useState<string>("안전");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (place && open) {
      fetchReviews();
    }
  }, [place, open]);

  const fetchReviews = async () => {
    if (!place) return;

    try {
      const { data, error } = await supabase
        .from("accessibility_reports")
        .select("*")
        .eq("status", "approved")
        .gte("latitude", place.lat - 0.001)
        .lte("latitude", place.lat + 0.001)
        .gte("longitude", place.lon - 0.001)
        .lte("longitude", place.lon + 0.001)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error("후기 조회 실패:", error);
    }
  };

  const handleSubmitReview = async () => {
    if (!place || !newReview.trim()) {
      toast.error("후기 내용을 입력해주세요.");
      return;
    }

    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        toast.error("후기를 작성하려면 로그인이 필요합니다.");
        return;
      }

      const { error } = await supabase
        .from("accessibility_reports")
        .insert({
          user_id: user.id,
          location_name: place.name,
          latitude: place.lat,
          longitude: place.lon,
          accessibility_level: accessibilityLevel,
          category: "시설",
          details: newReview,
          status: "pending",
        });

      if (error) throw error;

      toast.success("후기가 제출되었습니다. 관리자 승인 후 표시됩니다.");
      setNewReview("");
      setAccessibilityLevel("안전");
      fetchReviews();
    } catch (error) {
      console.error("후기 제출 실패:", error);
      toast.error("후기 제출에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "안전": return "bg-green-500";
      case "주의": return "bg-yellow-500";
      case "매우위험": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {place?.name || "장소"} - 접근성 후기
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* 후기 작성 섹션 */}
          <Card className="p-4 bg-accent/20">
            <h3 className="font-semibold mb-3">접근성 후기 작성</h3>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium mb-2 block">접근성 수준</label>
                <div className="flex gap-2">
                  {["안전", "주의", "매우위험"].map((level) => (
                    <Button
                      key={level}
                      variant={accessibilityLevel === level ? "default" : "outline"}
                      size="sm"
                      onClick={() => setAccessibilityLevel(level)}
                      className={accessibilityLevel === level ? getLevelColor(level) : ""}
                    >
                      {level}
                    </Button>
                  ))}
                </div>
              </div>

              <Textarea
                placeholder="이 장소의 접근성에 대해 자세히 알려주세요. (휠체어 접근성, 경사로, 엘리베이터, 화장실 등)"
                value={newReview}
                onChange={(e) => setNewReview(e.target.value)}
                rows={4}
                className="resize-none"
              />

              <Button 
                onClick={handleSubmitReview} 
                disabled={loading}
                className="w-full"
              >
                {loading ? "제출 중..." : "후기 제출"}
              </Button>
            </div>
          </Card>

          {/* 기존 후기 목록 */}
          <div>
            <h3 className="font-semibold mb-3">
              접근성 후기 ({reviews.length})
            </h3>

            {reviews.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">
                  아직 등록된 후기가 없습니다.<br />
                  첫 번째 후기를 작성해보세요!
                </p>
              </Card>
            ) : (
              <div className="space-y-3">
                {reviews.map((review) => (
                  <Card key={review.id} className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge className={getLevelColor(review.accessibility_level)}>
                          {review.accessibility_level}
                        </Badge>
                        <Badge variant="outline">{review.category}</Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(review.created_at).toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                    
                    <h4 className="font-medium mb-2">{review.location_name}</h4>
                    
                    {review.details && (
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {review.details}
                      </p>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PlaceReviewModal;
