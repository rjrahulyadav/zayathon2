import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Upload, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import QRImage from "@/assets/QR.jpeg";

const PaymentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  
  // Get registration ID from navigation state
  const registrationId = location.state?.registrationId;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!validTypes.includes(selectedFile.type)) {
        toast({
          title: "Invalid file type",
          description: "Please upload a JPEG, PNG, or PDF file",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (max 5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "File size should be less than 5MB",
          variant: "destructive",
        });
        return;
      }

      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a payment screenshot or PDF",
        variant: "destructive",
      });
      return;
    }

    if (!registrationId) {
      toast({
        title: "Registration ID missing",
        description: "Please complete registration first",
        variant: "destructive",
      });
      navigate("/register");
      return;
    }

    setUploading(true);

    try {
      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${registrationId}_${Date.now()}.${fileExt}`;
      const filePath = `payment-screenshots/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('payments')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('payments')
        .getPublicUrl(filePath);

      // Update registration with payment screenshot URL
      const { error: updateError } = await supabase
        .from('registrations')
        .update({ payment_screenshot: urlData.publicUrl })
        .eq('id', registrationId);

      if (updateError) {
        throw updateError;
      }

      setUploadSuccess(true);
      toast({
        title: "Payment screenshot uploaded!",
        description: "Your payment proof has been submitted successfully",
      });

      // Redirect to home after 3 seconds
      setTimeout(() => {
        navigate("/");
      }, 3000);

    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload payment screenshot",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  if (uploadSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-black to-blue-900 p-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-center"
        >
          <CheckCircle2 className="w-24 h-24 text-green-500 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-white mb-2">Payment Submitted!</h2>
          <p className="text-gray-300">Redirecting you to home page...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-blue-900 py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-8 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Complete Your Payment
          </h1>

          <div className="grid md:grid-cols-2 gap-6">
            {/* QR Code Section */}
            <Card className="bg-gray-900/50 border-purple-500/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Scan QR Code</CardTitle>
                <CardDescription className="text-gray-400">
                  Scan this QR code to make the payment
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <div className="bg-white p-4 rounded-lg mb-4">
                  <img 
                    src={QRImage} 
                    alt="Payment QR Code" 
                    className="w-64 h-64 object-contain"
                  />
                </div>
                <div className="text-center text-gray-300 space-y-2">
                  <p className="font-semibold text-lg">Registration Fee: ₹250</p>
                  <p className="text-sm text-gray-400">per team</p>
                </div>
              </CardContent>
            </Card>

            {/* Upload Section */}
            <Card className="bg-gray-900/50 border-purple-500/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Upload Payment Proof</CardTitle>
                <CardDescription className="text-gray-400">
                  Upload your payment screenshot or PDF
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="payment-file" className="text-white">
                    Payment Screenshot / PDF
                  </Label>
                  <div className="flex flex-col gap-4">
                    <Input
                      id="payment-file"
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,application/pdf"
                      onChange={handleFileChange}
                      className="bg-gray-800 border-gray-700 text-white cursor-pointer"
                    />
                    {file && (
                      <div className="flex items-center gap-2 text-green-400 text-sm">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{file.name}</span>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    Accepted formats: JPEG, PNG, PDF (Max 5MB)
                  </p>
                </div>

                <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-4">
                  <div className="flex gap-2">
                    <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-200">
                      <p className="font-semibold mb-1">Important:</p>
                      <ul className="list-disc list-inside space-y-1 text-xs">
                        <li>Ensure the payment screenshot is clear and readable</li>
                        <li>Include transaction ID and amount in the screenshot</li>
                        <li>Your registration will be confirmed after verification</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleUpload}
                  disabled={!file || uploading}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5 mr-2" />
                      Upload Payment Proof
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  onClick={() => navigate("/")}
                  className="w-full border-gray-700 text-gray-300 hover:bg-gray-800"
                >
                  Back to Home
                </Button>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PaymentPage;
