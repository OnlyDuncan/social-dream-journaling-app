import { NextResponse } from "next/server";
import { performSearch } from "@/lib/searchUtils";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);

        const q = searchParams.get("q") || undefined;
        const tagsParam = searchParams.get("tags");
        const typeParam = searchParams.get("type") as
            | "users"
            | "notes"
            | "both"
            | null;

        const tags = tagsParam
            ? tagsParam
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean)
            : undefined;

        const searchType = typeParam || "both";

        const results = await performSearch({
            query: q,
            tags,
            searchType,
        });

        return NextResponse.json(results);
    } catch (error) {
        console.error("Search API error:", error);
        return NextResponse.json(
            { error: "Search failed" },
            { status: 500 }
        );
    }
}

