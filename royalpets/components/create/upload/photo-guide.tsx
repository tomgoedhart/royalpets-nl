"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Camera, Sun, CircleDot, X, CheckCircle2, AlertCircle } from "lucide-react";

interface PhotoGuideProps {
  open: boolean;
  onClose: () => void;
}

interface PhotoExample {
  title: string;
  description: string;
  icon: React.ReactNode;
  goodExample: boolean;
}

const photoExamples: PhotoExample[] = [
  {
    title: "Front View",
    description:
      "Face your pet directly, at their eye level. Capture their full face with both eyes visible.",
    icon: <Camera className="h-5 w-5" />,
    goodExample: true,
  },
  {
    title: "Side Profile",
    description:
      "Capture the side of their head showing their unique profile and ear shape.",
    icon: <Camera className="h-5 w-5" />,
    goodExample: true,
  },
  {
    title: "Close-up Portrait",
    description:
      "A detailed shot of their face showing fur patterns, eye color, and personality.",
    icon: <Camera className="h-5 w-5" />,
    goodExample: true,
  },
  {
    title: "Good Lighting",
    description:
      "Use natural daylight or soft indoor lighting. Avoid harsh shadows or flash.",
    icon: <Sun className="h-5 w-5" />,
    goodExample: true,
  },
];

const badExamples: PhotoExample[] = [
  {
    title: "Blurry Photos",
    description:
      "Keep your hands steady or use burst mode. Blurry photos lose important details.",
    icon: <AlertCircle className="h-5 w-5" />,
    goodExample: false,
  },
  {
    title: "Dark or Backlit",
    description:
      "Avoid photos where your pet is in shadow or backlit by bright windows.",
    icon: <X className="h-5 w-5" />,
    goodExample: false,
  },
  {
    title: "Obstructions",
    description:
      "Remove collars, toys, or hands from the frame. We want to see your pet clearly!",
    icon: <X className="h-5 w-5" />,
    goodExample: false,
  },
  {
    title: "Too Far Away",
    description:
      "Get close enough that your pet fills most of the frame. We need to see the details!",
    icon: <CircleDot className="h-5 w-5" />,
    goodExample: false,
  },
];

export function PhotoGuide({ open, onClose }: PhotoGuideProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Camera className="h-5 w-5 text-blue-500" />
            Photo Guide
          </DialogTitle>
          <DialogDescription>
            Follow these tips to get the best results for your royal pet portrait
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Introduction */}
          <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-700">
            <p className="font-medium">Why good photos matter</p>
            <p className="mt-1">
              High-quality photos help our AI create a stunning, lifelike portrait
              of your pet. Clear details ensure we capture their unique features
              and personality!
            </p>
          </div>

          {/* Good Examples */}
          <div>
            <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-900">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              What Works Well
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {photoExamples.map((example, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-green-200 bg-green-50/50 p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-green-100 p-2 text-green-600">
                      {example.icon}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {example.title}
                      </h4>
                      <p className="mt-1 text-sm text-gray-600">
                        {example.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Visual Examples Placeholder */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">✓ Good Example</p>
              <div className="flex aspect-square items-center justify-center rounded-lg border-2 border-dashed border-green-300 bg-green-50/30">
                <div className="text-center">
                  <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                    <CheckCircle2 className="h-8 w-8 text-green-500" />
                  </div>
                  <p className="text-sm text-gray-500">
                    Clear, well-lit photo
                    <br />
                    at eye level
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">✗ Avoid This</p>
              <div className="flex aspect-square items-center justify-center rounded-lg border-2 border-dashed border-red-300 bg-red-50/30">
                <div className="text-center">
                  <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                    <X className="h-8 w-8 text-red-500" />
                  </div>
                  <p className="text-sm text-gray-500">
                    Blurry, dark, or distant
                    <br />
                    photo
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bad Examples */}
          <div>
            <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-900">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Common Mistakes to Avoid
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {badExamples.map((example, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-red-200 bg-red-50/50 p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-red-100 p-2 text-red-600">
                      {example.icon}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {example.title}
                      </h4>
                      <p className="mt-1 text-sm text-gray-600">
                        {example.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tips Section */}
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <h4 className="mb-2 font-medium text-gray-900">Pro Tips</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-blue-500">•</span>
                <span>
                  <strong>Use treats or toys</strong> to get your pet&apos;s attention
                  and capture their best expression
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500">•</span>
                <span>
                  <strong>Shoot outdoors or near windows</strong> for the best natural
                  lighting
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500">•</span>
                <span>
                  <strong>Take multiple shots</strong> so you can pick the best one
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500">•</span>
                <span>
                  <strong>Get on their level</strong> - kneel or lie down to shoot at
                  eye level
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500">•</span>
                <span>
                  <strong>Minimum resolution:</strong> 800x800 pixels for best results
                </span>
              </li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
