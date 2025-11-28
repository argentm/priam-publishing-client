'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ROUTES } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Music2,
  FileText,
  Users,
  TrendingUp,
} from 'lucide-react';

export default function OnboardingCompletePage() {
  const router = useRouter();
  const [showContent, setShowContent] = useState(false);

  // Trigger confetti and fade-in animation
  useEffect(() => {
    // Fire confetti
    const duration = 2000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors: ['#8B5CF6', '#EC4899', '#F59E0B'],
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors: ['#8B5CF6', '#EC4899', '#F59E0B'],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();

    // Show content with slight delay
    setTimeout(() => setShowContent(true), 300);
  }, []);

  const quickActions = [
    {
      icon: <Music2 className="w-5 h-5" />,
      title: 'Add your first work',
      description: 'Register a song to start collecting royalties',
    },
    {
      icon: <FileText className="w-5 h-5" />,
      title: 'Import from Spotify',
      description: 'Quickly import your catalog from Spotify',
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: 'Invite collaborators',
      description: 'Add co-writers and team members',
    },
    {
      icon: <TrendingUp className="w-5 h-5" />,
      title: 'View analytics',
      description: 'Track your royalty earnings',
    },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-b from-background to-muted/20">
      <div
        className={`w-full max-w-2xl text-center space-y-8 transition-all duration-700 ${
          showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        {/* Logo */}
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg">
            <Image
              src="/logos/priam-icon.svg"
              alt="Priam"
              width={40}
              height={40}
            />
          </div>
        </div>

        {/* Success icon */}
        <div className="relative inline-flex">
          <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle2 className="w-14 h-14 text-green-500" />
          </div>
          <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-primary flex items-center justify-center animate-bounce">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
        </div>

        {/* Message */}
        <div className="space-y-3">
          <h1 className="text-4xl font-bold tracking-tight">
            Welcome to Priam!
          </h1>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            Your account is set up and ready to go. Start managing your music
            publishing catalog and collecting royalties.
          </p>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
          {quickActions.map((action, index) => (
            <Card
              key={index}
              className="text-left hover:shadow-md transition-shadow cursor-pointer group"
              onClick={() => router.push(ROUTES.DASHBOARD)}
            >
              <CardContent className="p-4 flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                  {action.icon}
                </div>
                <div>
                  <p className="font-medium group-hover:text-primary transition-colors">
                    {action.title}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {action.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA */}
        <Button
          onClick={() => router.push(ROUTES.DASHBOARD)}
          size="lg"
          className="h-14 px-8 text-lg"
        >
          Go to Dashboard
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>

        <p className="text-sm text-muted-foreground">
          Need help getting started?{' '}
          <a href="#" className="text-primary hover:underline">
            Check out our guides
          </a>
        </p>
      </div>
    </div>
  );
}
