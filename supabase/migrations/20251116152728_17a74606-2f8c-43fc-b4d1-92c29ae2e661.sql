-- photo_url을 배열로 변경하고 기존 데이터 마이그레이션
ALTER TABLE accessibility_reports 
ADD COLUMN photo_urls text[];

-- 기존 photo_url 데이터를 photo_urls 배열로 복사
UPDATE accessibility_reports 
SET photo_urls = ARRAY[photo_url]
WHERE photo_url IS NOT NULL;

-- 기존 photo_url 컬럼 삭제
ALTER TABLE accessibility_reports 
DROP COLUMN photo_url;