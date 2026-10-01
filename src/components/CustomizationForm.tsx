"use client";

import React, { useState } from "react";
import { Sparkles, Shield, Check, Info } from "lucide-react";

interface CustomizationFormProps {
  basePrice: number;
  patchFee: number;
  onCustomizationChange: (data: {
    playerName: string;
    playerNumber: string;
    addPatches: boolean;
    patchType: string;
    totalPrice: number;
  }) => void;
}

export const CustomizationForm: React.FC<CustomizationFormProps> = ({
  basePrice,
  patchFee,
  onCustomizationChange,
}) => {
  const [playerName, setPlayerName] = useState("");
  const [playerNumber, setPlayerNumber] = useState("");
  const [addPatches, setAddPatches] = useState(false);
  const [patchType, setPatchType] = useState("UCL Starball & Respect Badge");

  const notifyChange = (
    name: string,
    num: string,
    patches: boolean,
    pType: string
  ) => {
    const total = basePrice + (patches ? patchFee : 0);
    onCustomizationChange({
      playerName: name.toUpperCase(),
      playerNumber: num,
      addPatches: patches,
      patchType: pType,
      totalPrice: total,
    });
  };

  const handleNameChange = (val: string) => {
    // limit name length to 12 chars standard jersey rule
    const formatted = val.slice(0, 12).toUpperCase();
    setPlayerName(formatted);
    notifyChange(formatted, playerNumber, addPatches, patchType);
  };

  const handleNumberChange = (val: string) => {
    // only digits, max 2 chars (0-99)
    const formatted = val.replace(/\D/g, "").slice(0, 2);
    setPlayerNumber(formatted);
    notifyChange(playerName, formatted, addPatches, patchType);
  };

  const handlePatchToggle = (checked: boolean) => {
    setAddPatches(checked);
    notifyChange(playerName, playerNumber, checked, patchType);
  };

  const handlePatchTypeChange = (type: string) => {
    setPatchType(type);
    notifyChange(playerName, playerNumber, addPatches, type);
  };

  return (
    <div className="bg-[#121215] border border-neutral-800 rounded-2xl p-5 sm:p-6 space-y-6">
      {/* Module Title */}
      <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-black uppercase text-white tracking-wider font-jersey">
            Kit Adda Print Studio
          </h3>
        </div>
        <span className="text-[11px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
          FREE NAME & NUMBER
        </span>
      </div>

      {/* Real-time Back Jersey Visualizer */}
      <div className="relative rounded-xl overflow-hidden bg-gradient-to-b from-[#18181c] to-[#0d0d10] border border-neutral-800/80 p-6 flex flex-col items-center justify-center min-h-[160px] shadow-inner">
        {/* Subtle shirt outline icon / watermark */}
        <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
          <span className="text-9xl font-black font-jersey">10</span>
        </div>

        <div className="z-10 text-center space-y-1">
          {playerName ? (
            <div className="font-jersey text-xl sm:text-2xl font-black tracking-[0.25em] text-white drop-shadow-md">
              {playerName}
            </div>
          ) : (
            <div className="font-jersey text-xs tracking-widest text-neutral-600 uppercase">
              [ YOUR NAME HERE ]
            </div>
          )}

          {playerNumber ? (
            <div className="font-jersey text-5xl sm:text-6xl font-black text-white tracking-wider drop-shadow-lg leading-tight text-emerald-400">
              {playerNumber}
            </div>
          ) : (
            <div className="font-jersey text-4xl font-black text-neutral-700">
              --
            </div>
          )}
        </div>

        {addPatches && (
          <div className="absolute bottom-2.5 right-3 bg-neutral-900/90 border border-emerald-500/40 text-emerald-400 text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow">
            <Shield className="w-2.5 h-2.5" />
            <span>{patchType.split(" ")[0]} Patch Applied</span>
          </div>
        )}
      </div>

      {/* Customization Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Player Name Input */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
            Player Name (Back)
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="e.g. BELLINGHAM"
              value={playerName}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full bg-[#09090b] border border-neutral-700/80 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-sm font-bold text-white placeholder-neutral-600 focus:outline-none uppercase tracking-wider"
              maxLength={12}
            />
            {playerName && (
              <span className="absolute right-3 top-2.5 text-[10px] text-neutral-500">
                {playerName.length}/12
              </span>
            )}
          </div>
        </div>

        {/* Player Number Input */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
            Jersey Number (Back)
          </label>
          <input
            type="text"
            placeholder="e.g. 5, 7, 10"
            value={playerNumber}
            onChange={(e) => handleNumberChange(e.target.value)}
            className="w-full bg-[#09090b] border border-neutral-700/80 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-sm font-bold text-white placeholder-neutral-600 focus:outline-none tracking-wider"
            maxLength={2}
          />
        </div>
      </div>

      {/* Sleeve Patches Checkbox Option */}
      <div className="p-4 rounded-xl bg-[#09090b] border border-neutral-800 space-y-3">
        <label className="flex items-start gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={addPatches}
            onChange={(e) => handlePatchToggle(e.target.checked)}
            className="mt-1 w-4 h-4 accent-emerald-500 rounded cursor-pointer"
          />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-bold text-white uppercase tracking-wide">
                Add Sleeve Competition Patches
              </span>
              <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                +₹{patchFee}
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 mt-0.5">
              Official heat-pressed competition arm badges (UCL, Premier League, or World Cup).
            </p>
          </div>
        </label>

        {addPatches && (
          <div className="pt-2 border-t border-neutral-800 grid grid-cols-1 sm:grid-cols-2 gap-2 animate-in fade-in duration-200">
            {[
              "UCL Starball & Respect Badge",
              "Premier League Golden Champions",
              "FIFA Club World Cup Gold Badge",
              "Copa America Champions Patch",
            ].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => handlePatchTypeChange(type)}
                className={`p-2 rounded-lg text-left text-xs font-semibold flex items-center justify-between border transition ${
                  patchType === type
                    ? "bg-emerald-500/10 border-emerald-500 text-emerald-300"
                    : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white"
                }`}
              >
                <span className="truncate">{type}</span>
                {patchType === type && <Check className="w-3.5 h-3.5 shrink-0" />}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-1.5 text-[11px] text-neutral-400">
        <Info className="w-3.5 h-3.5 text-neutral-500" />
        <span>Customized kits are heat-pressed with authentic vinyl lettering.</span>
      </div>
    </div>
  );
};
