import { ShieldAlert } from 'lucide-react';

export function DisclaimerBanner() {
  return (
    <div className="p-4 sm:p-5 rounded-xl bg-zinc-900/60 border border-zinc-800 text-label-md text-zinc-400 space-y-2 font-newsreader">
      <div className="flex items-center gap-2 text-zinc-300 font-normal text-base">
        <ShieldAlert className="w-4 h-4 text-red-500 shrink-0" />
        <span>Educational & Analytical Security Disclaimer</span>
      </div>
      <p className="text-body-md text-zinc-300 leading-relaxed">
        This scanner provides automated indicators based on URL characteristics. A low-risk result does not guarantee that a website is safe, and a high-risk result does not by itself prove that a website is malicious. Do not enter passwords, payment information, or other sensitive information into a suspicious website.
      </p>
    </div>
  );
}
