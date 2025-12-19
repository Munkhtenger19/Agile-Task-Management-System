"use client";

import { SignInButton, SignUpButton, useUser } from "@clerk/nextjs";
import { ArrowLeft, ChevronRight, Trello } from "lucide-react";
import React from "react";
import { Button } from "./ui/button";
import Link from "next/link";
interface NavbarProps {
  boardTitle?: string;
  onEditBoard?: () => void;
  isBoardPage?: boolean;
}
export default function Navbar({boardTitle, onEditBoard, isBoardPage}: NavbarProps){
  const { user, isSignedIn } = useUser();

  if (isBoardPage) {
    return (
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between py-4">
          <div className="flex items-center space-x-2 justify-between">
            <div className="flex items-center space-x-2">
              <Link
                href="/dashboard"
                className="flex items-center space-x-2 hover:text-gray-900 text-gray-600 flex-shrink-0"
              >
                <ArrowLeft className="size-4" />
                <span className="hidden sm:inline"> Back to dashboard</span>
                <span className="sm:hidden"> Back</span>
              </Link>
              <div className="flex items-center space-x-1 min-w-0">
                <Trello />
                <span className="text-lg items-center space-x-1 min-w-0">{boardTitle}</span>
                {onEditBoard && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs sm:text-sm ml-2"
                    onClick={onEditBoard}
                  >
                    Edit Board
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>
    );
  }
  return (
    <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between py-4">
        <div className="flex items-center space-x-2">
          <span>Trello clone</span>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-4">
          {isSignedIn ? (
            <div>
              <span>
                <Button>
                  <Link href="/dashboard">
                    Dashboard
                    <ChevronRight />
                  </Link>
                </Button>
              </span>
            </div>
          ) : (
            <div>
              <SignInButton>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs sm:text-sm"
                >
                  Sign In
                </Button>
              </SignInButton>
              <SignUpButton>
                <Button className="text-xs sm:text-sm">Sign Up</Button>
              </SignUpButton>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
