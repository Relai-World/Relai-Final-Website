import { useState, useEffect } from "react";
import Container from "@/components/ui/container";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Star, Award, Home, Check, Bookmark, Users, FileCheck, ChevronDown, ChevronUp, MoreHorizontal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Define the journey stages
const journeyStages = [
  {
    id: 1,
    title: "Property Requirements",
    description: "Define your ideal home requirements",
    icon: <Home className="h-6 w-6" />,
    reward: "Property Explorer Badge",
    rewardIcon: <Badge className="bg-[#FFC107] text-white border-none"><Star className="h-3 w-3 mr-1" /> Explorer</Badge>,
    points: 100
  },
  {
    id: 2,
    title: "Property Shortlisting",
    description: "Review and select properties with our experts",
    icon: <Bookmark className="h-6 w-6" />,
    reward: "Smart Selector Badge",
    rewardIcon: <Badge className="bg-[#FF5722] text-white border-none"><Star className="h-3 w-3 mr-1" /> Selector</Badge>,
    points: 200
  },
  {
    id: 3,
    title: "Site Visits",
    description: "Visit shortlisted properties with our agents",
    icon: <Users className="h-6 w-6" />,
    reward: "Property Scout Badge",
    rewardIcon: <Badge className="bg-[#9C27B0] text-white border-none"><Award className="h-3 w-3 mr-1" /> Scout</Badge>,
    points: 300
  },
  {
    id: 4,
    title: "Document Verification",
    description: "Verify property documents with our legal team",
    icon: <FileCheck className="h-6 w-6" />,
    reward: "Legal Eagle Badge",
    rewardIcon: <Badge className="bg-[#673AB7] text-white border-none"><Award className="h-3 w-3 mr-1" /> Eagle</Badge>,
    points: 400
  },
  {
    id: 5,
    title: "Purchase Completion",
    description: "Complete the property purchase transaction",
    icon: <Check className="h-6 w-6" />,
    reward: "Property Master Trophy",
    rewardIcon: <Badge className="bg-[#1752FF] text-white border-none"><Trophy className="h-3 w-3 mr-1" /> Master</Badge>,
    points: 500
  }
];

export default function JourneyTracker() {
  // In a real application, this would come from user data/API
  const [currentStage, setCurrentStage] = useState(2);
  const [totalPoints, setTotalPoints] = useState(300);
  const [showDetails, setShowDetails] = useState<number | null>(null);
  const [claimedRewards, setClaimedRewards] = useState<number[]>([1]);

  // Calculate progress percentage
  const progressPercentage = (currentStage / journeyStages.length) * 100;
  
  // Function to toggle stage details
  const toggleStageDetails = (stageId: number) => {
    if (showDetails === stageId) {
      setShowDetails(null);
    } else {
      setShowDetails(stageId);
    }
  };
  
  // Function to simulate claiming a reward
  const claimReward = (stageId: number) => {
    if (!claimedRewards.includes(stageId) && stageId <= currentStage) {
      setClaimedRewards([...claimedRewards, stageId]);
      
      // Simulate points animation (in a real app, this would be more sophisticated)
      const stagePoints = journeyStages.find(stage => stage.id === stageId)?.points || 0;
      setTotalPoints(prev => prev + stagePoints);
    }
  };

  // Animate the progress bar when component loads
  useEffect(() => {
    const timer = setTimeout(() => {
      const progressBar = document.querySelector('.progress-animation');
      if (progressBar) {
        progressBar.classList.add('animate-progress');
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Animation variants for framer-motion
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        when: "beforeChildren",
        staggerChildren: 0.2
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };
  
  const pulseAnimation = {
    scale: [1, 1.05, 1],
    transition: { repeat: Infinity, duration: 2 }
  };

  return (
    <section className="py-12 md:py-16 bg-white">
      <Container>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <h2 className="text-2xl md:text-4xl font-bold mb-4">Your Property Journey</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Track your progress through our seamless property buying experience and earn rewards along the way.
          </p>
          
          {/* Points Display */}
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4, type: "spring" }}
            whileHover={{ scale: 1.05 }}
            className="mt-6 inline-flex items-center px-4 py-2 bg-gradient-to-r from-[#1752FF] to-[#6A98FF] text-white rounded-full"
          >
            <motion.div
              animate={{
                rotate: [0, 15, 0, -15, 0],
              }}
              transition={{
                repeat: Infinity,
                repeatDelay: 3,
                duration: 1,
              }}
            >
              <Trophy className="h-5 w-5 mr-2" />
            </motion.div>
            <span className="font-bold">{totalPoints} Points</span>
          </motion.div>
        </motion.div>
        
        {/* Progress Bar */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <div className="flex justify-between text-sm text-gray-500 mb-2">
            <span>Start</span>
            <span>Property Owner</span>
          </div>
          
          <div className="relative h-2">
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="absolute top-0 left-0 h-full bg-[#1752FF] rounded-full"
            />
            <Progress value={100} className="h-2 bg-gray-200" />
            
            {journeyStages.map((stage, index) => (
              <motion.div
                key={`marker-${stage.id}`}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5 + (index * 0.1) }}
                style={{ 
                  left: `${(stage.id / journeyStages.length) * 100}%`,
                  transform: 'translateX(-50%)'
                }}
                className={`absolute top-0 w-4 h-4 rounded-full -mt-1 border-2 border-white
                  ${stage.id <= currentStage ? 'bg-[#1752FF]' : 'bg-gray-300'}`}
              />
            ))}
          </div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-2 text-right"
          >
            <span className="text-sm font-medium">{Math.round(progressPercentage)}% Complete</span>
          </motion.div>
        </motion.div>
        
        {/* Journey Stages */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          {journeyStages.map((stage, index) => {
            const isActive = stage.id <= currentStage;
            const isCurrent = stage.id === currentStage;
            const hasClaimedReward = claimedRewards.includes(stage.id);
            
            return (
              <motion.div
                key={stage.id}
                variants={itemVariants}
                transition={{ duration: 0.5 }}
                whileHover={{ y: isCurrent ? -5 : 0 }}
              >
                <Card 
                  className={`border-2 transition-all ${
                    isCurrent 
                      ? "border-[#1752FF] shadow-md" 
                      : isActive 
                        ? "border-green-500" 
                        : "border-gray-200 opacity-85"
                  }`}
                >
                  <CardContent className="p-4 md:p-6">
                    <div className="flex flex-wrap justify-between items-center">
                      <div className="flex items-center">
                        <motion.div 
                          animate={isCurrent ? pulseAnimation : {}}
                          className={`
                            flex items-center justify-center rounded-full w-10 h-10 mr-4
                            ${isActive ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}
                            ${isCurrent ? 'bg-[#1752FF] text-white ring-4 ring-blue-100' : ''}
                          `}
                        >
                          {isActive ? 
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: "spring", delay: index * 0.1 }}
                            >
                              <Check className="h-5 w-5" />
                            </motion.div> 
                            : stage.icon}
                        </motion.div>
                        <div>
                          <h3 className="font-semibold text-lg">{stage.title}</h3>
                          <p className="text-sm text-gray-600">{stage.description}</p>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap items-center mt-3 md:mt-0 space-x-2">
                        {isActive && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", delay: index * 0.1 + 0.3 }}
                          >
                            {stage.rewardIcon}
                          </motion.div>
                        )}
                        
                        {isActive && !hasClaimedReward && (
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="border-[#1752FF] text-[#1752FF] hover:bg-[#1752FF] hover:text-white group"
                              onClick={() => claimReward(stage.id)}
                            >
                              <motion.div
                                animate={{ rotate: [0, 15, 0, -15, 0] }}
                                transition={{ repeat: Infinity, repeatDelay: 2, duration: 0.7 }}
                              >
                                <Trophy className="h-4 w-4 mr-1 group-hover:text-yellow-200" />
                              </motion.div>
                              Claim {stage.points} Points
                            </Button>
                          </motion.div>
                        )}
                        
                        {hasClaimedReward && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring" }}
                          >
                            <Badge variant="outline" className="bg-[#F5F5DC] border-none">
                              <Check className="h-3 w-3 mr-1" /> Claimed
                            </Badge>
                          </motion.div>
                        )}
                        
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => toggleStageDetails(stage.id)}
                            className={isActive ? "" : "text-gray-400"}
                          >
                            {showDetails === stage.id ? (
                              <>Hide Details <ChevronUp className="ml-1 h-4 w-4" /></>
                            ) : (
                              <>Show Details <ChevronDown className="ml-1 h-4 w-4" /></>
                            )}
                          </Button>
                        </motion.div>
                      </div>
                    </div>
                    
                    {/* Expanded Details - Using AnimatePresence for smooth transitions */}
                    <AnimatePresence>
                      {showDetails === stage.id && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <motion.div 
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.1 }}
                            className="mt-4 pt-4 border-t border-gray-100"
                          >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <h4 className="font-medium text-sm text-gray-700 mb-2">Stage Activities:</h4>
                                <motion.ul
                                  variants={containerVariants}
                                  initial="hidden"
                                  animate="visible"
                                  className="text-sm text-gray-600 space-y-1"
                                >
                                  <motion.li variants={itemVariants} className="flex items-start">
                                    <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                                    <span>Fill out your property requirements</span>
                                  </motion.li>
                                  <motion.li variants={itemVariants} className="flex items-start">
                                    <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                                    <span>Consultation with our property experts</span>
                                  </motion.li>
                                  <motion.li variants={itemVariants} className="flex items-start">
                                    <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                                    <span>Initial budget planning</span>
                                  </motion.li>
                                </motion.ul>
                              </div>
                              <div>
                                <h4 className="font-medium text-sm text-gray-700 mb-2">Reward Details:</h4>
                                <motion.div 
                                  initial={{ scale: 0.9, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  transition={{ delay: 0.2 }}
                                  className="flex items-center"
                                >
                                  {stage.rewardIcon}
                                  <span className="ml-2 text-sm text-gray-600">{stage.reward}</span>
                                </motion.div>
                                <motion.p 
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ delay: 0.3 }}
                                  className="mt-2 text-sm text-gray-600"
                                >
                                  Complete this stage to earn {stage.points} points and unlock exclusive benefits.
                                </motion.p>
                              </div>
                            </div>
                          </motion.div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
        
        {/* Call to Action */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="mt-10 text-center"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button className="bg-[#1752FF] hover:bg-[#1240CC] text-white rounded-full px-8 py-6 group">
              Continue Your Property Journey
              <motion.div
                className="inline-block ml-2"
                animate={{ x: [0, 5, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                →
              </motion.div>
            </Button>
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
}