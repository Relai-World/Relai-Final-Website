import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import Container from '@/components/ui/container';
import { 
  Scale, 
  Building, 
  TrendingUp, 
  Award, 
  Crown,
  ArrowRight,
  CheckCircle
} from 'lucide-react';

export default function PropertyComparisonHub() {
  return (
    <section className="py-16 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Container>
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-6">
            <Scale className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Property Comparison Hub
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Compare properties side-by-side with intelligent analysis. Make informed decisions with our advanced comparison tools that highlight the best features and value propositions.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Features */}
          <div className="space-y-8">
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Crown className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Smart Comparison Indicators</h3>
                  <p className="text-gray-600">Instantly see which property offers the best value with crown icons and color-coded highlights for price, size, and amenities.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Price Analysis</h3>
                  <p className="text-gray-600">Compare price ranges, cost per sq ft, and identify the best value propositions with visual indicators and detailed breakdowns.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Award className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Feature Comparison</h3>
                  <p className="text-gray-600">Compare configurations, sizes, RERA status, and builder reputation in an easy-to-read table format.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Side-by-Side Analysis</h3>
                  <p className="text-gray-600">Compare up to 3 properties simultaneously with detailed parameter analysis to make confident decisions.</p>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <Link href="/comparison">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  Start Comparing Properties
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Side - Visual Preview */}
          <div className="relative">
            <div className="bg-white rounded-2xl shadow-2xl p-6 border border-gray-200">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Property Comparison Preview</h3>
                <p className="text-gray-600 text-sm">Compare key metrics at a glance</p>
              </div>

              {/* Mock comparison preview */}
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="text-xs font-medium text-gray-500">Parameters</div>
                  <div className="text-xs font-medium text-blue-600">Property A</div>
                  <div className="text-xs font-medium text-purple-600">Property B</div>
                </div>

                <div className="grid grid-cols-3 gap-3 items-center py-3 border-t border-gray-100">
                  <div className="text-sm font-medium text-gray-700">Price Range</div>
                  <div className="text-center">
                    <div className="bg-green-100 border-2 border-green-300 rounded-lg p-2">
                      <span className="text-green-700 font-bold text-sm">₹45.3L</span>
                      <Crown className="w-3 h-3 text-yellow-500 inline ml-1" />
                      <div className="text-xs text-green-600 mt-1">Best Value</div>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-2">
                      <span className="text-red-600 font-bold text-sm">₹67.8L</span>
                      <div className="text-xs text-red-500 mt-1">Higher Price</div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 items-center py-3 border-t border-gray-100">
                  <div className="text-sm font-medium text-gray-700">Size</div>
                  <div className="text-center">
                    <div className="bg-white border border-gray-200 rounded-lg p-2">
                      <span className="text-gray-900 font-bold text-sm">1055 sq ft</span>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="bg-emerald-100 border-2 border-emerald-300 rounded-lg p-2">
                      <span className="text-emerald-700 font-bold text-sm">1445 sq ft</span>
                      <Crown className="w-3 h-3 text-yellow-500 inline ml-1" />
                      <div className="text-xs text-emerald-600 mt-1">Largest Space</div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 items-center py-3 border-t border-gray-100">
                  <div className="text-sm font-medium text-gray-700">RERA Status</div>
                  <div className="text-center">
                    <span className="inline-flex items-center text-green-600 font-bold bg-green-100 px-2 py-1 rounded-full text-xs">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Approved
                    </span>
                  </div>
                  <div className="text-center">
                    <span className="inline-flex items-center text-green-600 font-bold bg-green-100 px-2 py-1 rounded-full text-xs">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Approved
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 text-center">
                <Link href="/comparison">
                  <Button variant="outline" size="sm" className="text-blue-600 border-blue-600 hover:bg-blue-50">
                    View Full Comparison
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-20 blur-xl"></div>
            <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-20 blur-xl"></div>
          </div>
        </div>
      </Container>
    </section>
  );
}