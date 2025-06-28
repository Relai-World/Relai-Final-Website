import { BuilderInfoType } from '@/lib/data/mock-properties';
import { Star } from 'lucide-react';

interface BuilderInfoProps {
  builder: BuilderInfoType;
}

export default function BuilderInfo({ builder }: BuilderInfoProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-xl font-bold">Builder Information</h3>
        <div className="flex items-center">
          <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
          <span className="ml-1 font-medium">{builder.rating}/5</span>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="text-lg font-semibold text-gray-900">{builder.name}</h4>
          <p className="text-sm text-gray-500">Established in {builder.established}</p>
        </div>

        <p className="text-gray-700">{builder.description}</p>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="bg-[#F8FAFF] p-3 rounded-md">
            <div className="text-2xl font-bold text-[#1752FF]">{builder.projectsCompleted}</div>
            <div className="text-sm text-gray-600">Projects Completed</div>
          </div>
          <div className="bg-[#F8FAFF] p-3 rounded-md">
            <div className="text-2xl font-bold text-[#1752FF]">{builder.projectsOngoing}</div>
            <div className="text-sm text-gray-600">Ongoing Projects</div>
          </div>
        </div>

        {builder.awards && builder.awards.length > 0 && (
          <div className="mt-4">
            <h4 className="text-md font-semibold mb-2">Awards & Recognition</h4>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              {builder.awards.map((award, index) => (
                <li key={index}>{award}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}