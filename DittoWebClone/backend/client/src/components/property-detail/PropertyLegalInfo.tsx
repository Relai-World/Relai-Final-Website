import { AlertTriangle, Award, Check, File, FileCheck } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface PropertyLegalInfoProps {
  legalInfo: {
    reraId: string;
    approvals: string[];
    legalDocuments: string[];
  };
}

export default function PropertyLegalInfo({ legalInfo }: PropertyLegalInfoProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-xl font-bold">Legal Information</h3>
        <span className="flex items-center text-sm text-green-600 font-medium">
          <Award className="h-4 w-4 mr-1" /> Relai Verified
        </span>
      </div>

      <div className="mb-6">
        <div className="flex items-center mb-2">
          <FileCheck className="h-5 w-5 text-[#1752FF] mr-2" />
          <h4 className="text-gray-900 font-semibold">RERA Registration</h4>
        </div>
        <div className="bg-gray-50 p-4 rounded-md ml-7">
          <p className="text-gray-700 font-medium">{legalInfo.reraId}</p>
          <p className="text-xs text-gray-500 mt-1">
            Verified by Relai on {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>

      <Alert className="mb-6 border-yellow-200 bg-yellow-50">
        <AlertTriangle className="h-4 w-4 text-yellow-600" />
        <AlertTitle className="text-yellow-800 font-medium">Important Note</AlertTitle>
        <AlertDescription className="text-yellow-700 text-sm">
          Always verify legal documents before making any payment. Relai has verified these documents, but we recommend you to check with your legal advisor.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center mb-3">
            <Check className="h-5 w-5 text-green-500 mr-2" />
            <h4 className="text-gray-900 font-semibold">Approvals</h4>
          </div>
          <ul className="space-y-2 ml-7">
            {legalInfo.approvals.map((approval, index) => (
              <li key={index} className="flex items-start">
                <Check className="h-4 w-4 text-green-500 mr-2 mt-1 flex-shrink-0" />
                <span className="text-gray-700">{approval}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="flex items-center mb-3">
            <File className="h-5 w-5 text-[#1752FF] mr-2" />
            <h4 className="text-gray-900 font-semibold">Legal Documents</h4>
          </div>
          <ul className="space-y-3 ml-7">
            {legalInfo.legalDocuments.map((document, index) => (
              <li key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <File className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-gray-700">{document}</span>
                </div>
                <button className="text-xs text-[#1752FF] hover:underline">
                  View
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}