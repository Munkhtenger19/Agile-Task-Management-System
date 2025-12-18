"use client";

import { SignInButton, SignUpButton, useUser } from "@clerk/nextjs";
import { ChevronRight, Trello } from "lucide-react";
import React from "react";
import { Button } from "./ui/button";
import Link from "next/link";

export default function Navbar() {
  const { user, isSignedIn } = useUser();
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
