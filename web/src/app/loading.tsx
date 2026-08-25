import React from "react";
import Image from "next/image";

export default function Loading() {
  return (
    <div className="loading-screen">
      <div className="loading-logo-container">
        <Image 
          src="/nova_v2.jpg" 
          alt="NovaFeeds" 
          width={80}
          height={80}
          className="loading-logo"
          priority
        />
      </div>
      <div className="loading-text">
        Loading Intelligence...
      </div>
    </div>
  );
}
