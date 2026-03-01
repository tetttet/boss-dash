import React from "react";

const PrivacyData = () => {
  return (
    <>
      <h2 className="text-base font-medium">Data Protection and Security</h2>

      <p>
        Bossforskiy places the highest priority on the protection and
        confidentiality of personal data. We implement robust technical,
        administrative, and organizational safeguards designed to protect your
        information against unauthorized access, loss, misuse, alteration, or
        disclosure.
      </p>

      <p>
        Our digital infrastructure is built on modern cloud technologies,
        including secure database solutions hosted on Neon Cloud. All data
        storage and processing environments are configured according to industry
        best practices, with continuous monitoring, access restrictions, and
        regular security updates.
      </p>

      <p>
        Bossforskiy’s backend architecture operates through a secure
        Express-based server environment, where access to sensitive systems is
        strictly limited to authorized personnel only. Role-based access
        controls are applied to ensure that personal data is handled solely by
        individuals who require it for legitimate operational purposes.
      </p>

      <p>
        To further protect user accounts and administrative access, we implement
        multi-layer authentication mechanisms, including two-factor verification
        <b> (2FA)</b>, secure session management, and advanced password hashing. All
        sensitive information is transmitted using encrypted communication
        protocols and stored using modern cryptographic methods.
      </p>

      <p>
        We continuously evaluate and improve our security practices by applying
        preventive measures against data breaches, fraud attempts, and
        unauthorized system access. Regular audits, monitoring tools, and
        incident response procedures are in place to ensure a rapid and
        effective reaction to potential security risks.
      </p>

      <p>
        While no digital system can guarantee absolute security, Bossforskiy is
        committed to maintaining a level of protection that meets or exceeds
        industry standards for premium e-commerce and cosmetic brands, ensuring
        that your personal data is treated with care, responsibility, and
        respect.
      </p>

      <p className="mt-6 text-sm text-muted-foreground">
        This data protection framework is overseen and maintained by
        Bossforskiy’s technical leadership.
        <br />
        <span className="font-medium text-foreground">
          TURAN-YAHYA GAZIZULY, CTO
        </span>
      </p>
    </>
  );
};

export default PrivacyData;
