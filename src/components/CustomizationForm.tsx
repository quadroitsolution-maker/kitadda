"use client";

import React, { useState } from "react";
import { Shield, Check, Info } from "lucide-react";

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
    const formatted = val.slice(0, 12).toUpperCase();
    setPlayerName(formatted);
    notifyChange(formatted, playerNumber, addPatches, patchType);
  };

  const handleNumberChange = (val: string) => {
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
    <div className="bg-[#0E131F] border border-[#1C2438] rounded-none p-4 sm:p-6 space-y-5 sm:space-y-6">
      {/* Module Title */}
      <div className="flex items-center justify-between border-b border-[#1C2438] pb-3">
        <h3 className="text-xs font-black uppercase text-white tracking-widest font-jersey">
          Kit Adda Print Studio
        </h3>
        <span className="text-[10px] bg-[#0B132B] text-[#DFB76C] border border-[#C5A059]/40 px-2 py-0.5 rounded-none font-bold uppercase tracking-wider">
          FREE PRINTING
        </span>
      </div>

      {/* Real-time Back Jersey Visualizer */}
      <div className="relative rounded-none overflow-hidden bg-[#0A0D14] border border-[#1C2438] p-5 sm:p-6 flex flex-col items-center justify-center min-h-[140px] sm:min-h-[160px]">
        {/* Watermark */}
        <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
          <span className="text-8xl sm:text-9xl font-black font-jersey">10</span>
        </div>

        <div className="z-10 text-center space-y-1">
          {playerName ? (
            <div className="font-jersey text-lg sm:text-2xl font-black tracking-[0.22em] text-white">
              {playerName}
            </div>
          ) : (
            <div className="font-jersey text-xs tracking-widest text-neutral-600 uppercase">
              [ YOUR NAME HERE ]
            </div>
          )}

          {playerNumber ? (
            <div className="font-jersey text-4xl sm:text-6xl font-black tracking-wider leading-tight text-[#DFB76C]">
              {playerNumber}
            </div>
          ) : (
            <div className="font-jersey text-3xl sm:text-4xl font-black text-neutral-700">
              --
            </div>
          )}
        </div>

        {addPatches && (
          <div className="absolute bottom-2 right-2 sm:bottom-2.5 sm:right-3 bg-[#0B132B] border border-[#C5A059]/40 text-[#DFB76C] text-[9px] font-bold px-2 py-0.5 rounded-none flex items-center gap-1">
            <Shield className="w-2.5 h-2.5" />
            <span>{patchType.split(" ")[0]} Applied</span>
          </div>
        )}
      </div>

      {/* Customization Inputs - iOS zoom-safe font sizes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
        {/* Player Name Input */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-300">
              Player Name (Back)
            </label>
            <span className="text-[10px] text-neutral-500 font-mono">
              {playerName.length}/12
            </span>
          </div>
          <input
            type="text"
            placeholder="e.g. BELLINGHAM"
            value={playerName}
            onChange={(e) => handleNameChange(e.target.value)}
            autoCapitalize="characters"
            autoCorrect="off"
            spellCheck={false}
            className="w-full bg-[#0A0D14] border border-[#1C2438] focus:border-[#C5A059] rounded-none px-3.5 py-3 text-base sm:text-xs font-bold text-white placeholder-neutral-600 focus:outline-none uppercase tracking-wider"
            maxLength={12}
          />
        </div>

        {/* Player Number Input */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-300">
              Jersey Number (Back)
            </label>
            <span className="text-[10px] text-neutral-500 font-mono">
              Max 2 digits
            </span>
          </div>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="e.g. 5, 7, 10"
            value={playerNumber}
            onChange={(e) => handleNumberChange(e.target.value)}
            className="w-full bg-[#0A0D14] border border-[#1C2438] focus:border-[#C5A059] rounded-none px-3.5 py-3 text-base sm:text-xs font-bold text-white placeholder-neutral-600 focus:outline-none tracking-wider"
            maxLength={2}
          />
        </div>
      </div>

      {/* Sleeve Patches Option */}
      <div className="p-3.5 sm:p-4 rounded-none bg-[#0A0D14] border border-[#1C2438] space-y-3">
        <label className="flex items-start gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={addPatches}
            onChange={(e) => handlePatchToggle(e.target.checked)}
            className="mt-0.5 w-4 h-4 accent-[#C5A059] rounded-none cursor-pointer"
          />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-bold text-white uppercase tracking-wide">
                Add Sleeve Competition Patches
              </span>
              <span className="text-xs font-bold text-[#DFB76C] bg-[#0B132B] px-2 py-0.5 rounded-none border border-[#C5A059]/40">
                +₹{patchFee}
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 mt-0.5">
              Official heat-pressed competition arm badges (UCL, Premier League, or World Cup).
            </p>
          </div>
        </label>

        {addPatches && (
          <div className="pt-2 border-t border-[#1C2438] grid grid-cols-1 sm:grid-cols-2 gap-2 animate-in fade-in duration-150">
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
                className={`min-h-[40px] p-2.5 rounded-none text-left text-xs font-semibold flex items-center justify-between border transition active:scale-[0.99] ${
                  patchType === type
                    ? "bg-[#0B132B] border-[#C5A059] text-[#DFB76C]"
                    : "bg-[#0E131F] border-[#1C2438] text-neutral-400 hover:text-white"
                }`}
              >
                <span className="truncate pr-1">{type}</span>
                {patchType === type && <Check className="w-3.5 h-3.5 shrink-0 text-[#DFB76C]" />}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-1.5 text-[11px] text-neutral-400">
        <Info className="w-3.5 h-3.5 text-[#DFB76C] shrink-0" />
        <span>Customized kits are heat-pressed with authentic vinyl lettering.</span>
      </div>
    </div>
  );
};
