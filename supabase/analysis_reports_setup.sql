-- AI 분석 리포트 테이블 생성
CREATE TABLE IF NOT EXISTS "public"."analysis_reports" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    "user_id" uuid NOT NULL,
    "plant_id" uuid,
    "pest_class_name" text,
    "pest_kr_name" text,
    "pest_confidence" numeric,
    "organ" text,
    "organ_confidence" numeric,
    "stage" text,
    "stage_confidence" numeric,
    "image_url" text,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,

    CONSTRAINT "analysis_reports_user_id_fkey"
        FOREIGN KEY ("user_id")
        REFERENCES "public"."Users"("id")
        ON DELETE CASCADE,

    CONSTRAINT "analysis_reports_plant_id_fkey"
        FOREIGN KEY ("plant_id")
        REFERENCES "public"."User_Plants"("id")
        ON DELETE SET NULL
);

-- Row Level Security 활성화
ALTER TABLE "public"."analysis_reports" ENABLE ROW LEVEL SECURITY;

-- 사용자가 자신의 리포트만 볼 수 있도록
CREATE POLICY "Users can view their own analysis reports"
    ON "public"."analysis_reports"
    FOR SELECT
    USING (auth.uid() = user_id);

-- 사용자가 자신의 리포트만 생성할 수 있도록
CREATE POLICY "Users can insert their own analysis reports"
    ON "public"."analysis_reports"
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- 사용자가 자신의 리포트만 삭제할 수 있도록
CREATE POLICY "Users can delete their own analysis reports"
    ON "public"."analysis_reports"
    FOR DELETE
    USING (auth.uid() = user_id);

-- 권한 부여
GRANT ALL ON TABLE "public"."analysis_reports" TO "anon";
GRANT ALL ON TABLE "public"."analysis_reports" TO "authenticated";
GRANT ALL ON TABLE "public"."analysis_reports" TO "service_role";

-- 인덱스 생성 (성능 향상)
CREATE INDEX "analysis_reports_user_id_idx" ON "public"."analysis_reports" USING btree ("user_id");
CREATE INDEX "analysis_reports_created_at_idx" ON "public"."analysis_reports" USING btree ("created_at" DESC);
