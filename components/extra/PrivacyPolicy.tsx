import React from "react";
import { Separator } from "@/components/ui/separator";
import PrivacyInfo from "./privacy/info";
import PrivacyUse from "./privacy/use";
import PrivacyData from "./privacy/data";

const PrivacyPolicy = () => {
  return (
    <section className="max-w-3xl mx-auto px-6 py-16">
      {/* Title */}
      <div className="space-y-2 mb-10">
        <h1 className="text-3xl font-semibold tracking-tight">
          Privacy Policy
        </h1>
        <p className="text-sm text-muted-foreground">
          Last updated: 26 December 2025
        </p>
        <p className="text-sm text-muted-foreground">
          Copyright © 2025{" "}
          <b className="hover:underline">TURAN-YAHYA GAZIZULY</b>. All rights
          reserved.
        </p>
        <p className="text-sm text-muted-foreground">
          This Privacy Policy outlines how Bossforskiy collects, uses, and
          protects your personal data.
        </p>
      </div>

      <Separator className="mb-10" />

      {/* Content */}
      <div className="space-y-10 text-sm leading-relaxed text-foreground">
        <p>
          Bossforskiy respects your privacy and is committed to protecting your
          personal data. This Privacy Policy explains how we collect, use, and
          safeguard your information when you interact with our website and
          services.
        </p>

        <div className="space-y-3">
          <PrivacyInfo />
        </div>

        <div className="space-y-3">
          <PrivacyUse />
        </div>

        <div className="space-y-3">
          <PrivacyData />
        </div>

        <div className="space-y-3">
          <h2 className="text-base font-medium">Third-Party Services</h2>
          <p>
            We do not sell or rent your personal data. Information may be shared
            with trusted third parties only when necessary to operate our
            services or comply with legal obligations.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="text-base font-medium">Your Rights</h2>
          <p>
            You have the right to access, update, or request deletion of your
            personal data in accordance with applicable data protection laws.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="text-base font-medium">Contact Us</h2>
          <p>
            If you have any questions regarding this Privacy Policy, please
            contact us at{" "}
            <span className="font-medium">privacy@bossforskiy.com</span>.
          </p>
        </div>
      </div>
    </section>
  );
};

export default PrivacyPolicy;
