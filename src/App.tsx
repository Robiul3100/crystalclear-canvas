import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/hooks/useTheme";
import Index from "./pages/Index";
import WatermarkRemover from "./pages/WatermarkRemover";
import ToolPage from "./pages/ToolPage";
import NotFound from "./pages/NotFound";
import CropTool from "./pages/tools/CropTool";
import ResizeTool from "./pages/tools/ResizeTool";
import RotateTool from "./pages/tools/RotateTool";
import CompressTool from "./pages/tools/CompressTool";
import SharpenTool from "./pages/tools/SharpenTool";
import ColorEnhancerTool from "./pages/tools/ColorEnhancerTool";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/watermark-remover" element={<WatermarkRemover />} />
            <Route path="/tool/crop" element={<CropTool />} />
            <Route path="/tool/resize" element={<ResizeTool />} />
            <Route path="/tool/rotate" element={<RotateTool />} />
            <Route path="/tool/compress" element={<CompressTool />} />
            <Route path="/tool/image-sharpener" element={<SharpenTool />} />
            <Route path="/tool/color-enhancer" element={<ColorEnhancerTool />} />
            <Route path="/tool/:toolId" element={<ToolPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
