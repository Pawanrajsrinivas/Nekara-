import React from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  variant?: "horizontal" | "mark";
  priority?: boolean;
}

export function Logo({ className, variant = "horizontal", priority = true }: LogoProps) {
  if (variant === "mark") {
    return (
      <Link
        href="/"
        className={cn(
          "inline-flex items-center justify-center transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B58A45]",
          className
        )}
        aria-label="NEKARA Sarees & Textiles — Return to Homepage"
      >
        <div className="relative w-10 h-10 sm:w-11 sm:h-11">
          <Image
            src="/images/brand/tab%20logo.png"
            alt="NEKARA Peacock Mark"
            fill
            sizes="44px"
            className="object-contain"
            priority={priority}
          />
        </div>
      </Link>
    );
  }

  return (
    <Link
      href="/"
      className={cn(
        "inline-flex items-center transition-transform duration-300 hover:scale-[1.01] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B58A45] rounded-sm",
        className
      )}
      aria-label="NEKARA Sarees & Textiles — Return to Homepage"
    >
      <div className="relative h-10 w-[120px] sm:h-12 sm:w-[145px] md:h-[50px] md:w-[155px] lg:h-[54px] lg:w-[165px]">
        <Image
          src="/images/brand/logo.png"
          alt="NEKARA Sarees & Textiles — Estd. 2001"
          fill
          sizes="(max-width: 640px) 120px, (max-width: 1024px) 155px, 165px"
          className="object-contain drop-shadow-[0_1px_3px_rgba(0,0,0,0.25)]"
          priority={priority}
        />
      </div>
    </Link>
  );
}
