import { LoadingPanel } from "@/components/ui/loading-panel";

export default function AuthLoading() {
  return (
    <main className="grid min-h-[100dvh] place-items-center bg-[#0A0A0A] px-4">
      <div className="w-full max-w-md">
        <LoadingPanel compact />
      </div>
    </main>
  );
}
