import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Flame, Soup, Trash2, Save, ChefHat, Wand2, Plus, Minus, TimerReset } from "lucide-react";

// --- Helper utils ---
const EMOJI_PANTRY = [
  "🥚","🍅","🍞","🧀","🥓","🍗","🍤","🥦","🍄","🧄","🧅","🫑","🍝","🍚","🍜","🍔","🍕","🥗","🍰","🍩","🧈","🧂","🌶️","🫙","🧊","🥔","🐟","🌽","🍌","🍫","🥬","🍓","🥜","🍯","🍎","🍋"
];

const COOKWARES = [
  { id: "pan", name: "Pan", icon: <Flame className="h-4 w-4" /> },
  { id: "pot", name: "Pot", icon: <Soup className="h-4 w-4" /> },
];

// canonicalize array of emojis to a key (sorted, joined)
function keyFor(ingredients) {
  return [...ingredients].sort((a,b)=>a.localeCompare(b)).join("");
}

// Built-in recipes: match by cookware + ingredients key
const BASE_RECIPES = [
  { cookware: "pan", items: ["🥚"], result: { emoji: "🍳", name: "Fried Egg" } },
  { cookware: "pan", items: ["🍞","🧀","🍞"], result: { emoji: "🥪", name: "Grilled Cheese" } },
  { cookware: "pan", items: ["🥓","🥚"], result: { emoji: "🍳", name: "Bacon & Eggs" } },
  { cookware: "pan", items: ["🍤","🧄","🌶️"], result: { emoji: "🍤", name: "Spicy Garlic Shrimp" } },
  { cookware: "pan", items: ["🐟","🧈","🧄","🌶️"], result: { emoji: "🐟", name: "Pan-Seared Fish" } },
  { cookware: "pot", items: ["🍝","🍅","🧄","🧅"], result: { emoji: "🍝", name: "Spaghetti Marinara" } },
  { cookware: "pot", items: ["🍚","🍗","🧅","🥦"], result: { emoji: "🍛", name: "Chicken Rice Bowl" } },
  { cookware: "pot", items: ["🍜","🍤","🧄","🌶️"], result: { emoji: "🍜", name: "Spicy Shrimp Ramen" } },
  { cookware: "pan", items: ["🍄","🧅","🧄","🥦"], result: { emoji: "🥘", name: "Veggie Stir-fry" } },
  { cookware: "pan", items: ["🥔","🧈","🧄"], result: { emoji: "🥔", name: "Garlic Butter Potatoes" } },
  { cookware: "pan", items: ["🍌","🍫"], result: { emoji: "🍫", name: "Chocolate Banana Melt" } },
  { cookware: "pot", items: ["🍚","🍤","🧂"], result: { emoji: "🍣", name: "Shrimp Rice (cheffy)" } },
  { cookware: "pan", items: ["🥬","🥚"], result: { emoji: "🥗", name: "Egg Salad" } },
  { cookware: "pot", items: ["🍓","🍌","🍯"], result: { emoji: "🍓", name: "Fruit Compote" } },
  { cookware: "pan", items: ["🥜","🍫"], result: { emoji: "🥜", name: "Peanut Choco Treat" } },
  { cookware: "pot", items: ["🍎","🍋","🍯"], result: { emoji: "🥧", name: "Apple Lemon Dessert" } },
];

function matchRecipe(cookware, items, customRecipes) {
  const searchKey = keyFor(items);
  const all = [...BASE_RECIPES, ...customRecipes];
  return all.find(r => r.cookware === cookware && keyFor(r.items) === searchKey);
}

// Generate default name for custom dish if not matched
function generateDefaultName(items, heatLabel) {
  const names = items.map(e => {
    switch (e) {
      case "🐟": return "fish";
      case "🍋": return "lemon";
      case "🥚": return "egg";
      case "🥦": return "broccoli";
      case "🍞": return "bread";
      case "🧀": return "cheese";
      case "🍅": return "tomato";
      default: return e;
    }
  });
  const joined = names.join(" + ");
  return `${joined} on ${heatLabel.toLowerCase()} heat`;
}

export default function EmojiKitchen() {
  const [selectedCookware, setSelectedCookware] = useState("pan");
  const [panItems, setPanItems] = useState([]);
  const [potItems, setPotItems] = useState([]);
  const [heat, setHeat] = useState(5);
  const [isCooking, setIsCooking] = useState(false);
  const [dish, setDish] = useState(null);
  const [customName, setCustomName] = useState("");
  const [customRecipes, setCustomRecipes] = useState([]);

  const activeItems = selectedCookware === "pan" ? panItems : potItems;
  const setActiveItems = selectedCookware === "pan" ? setPanItems : setPotItems;

  const canCook = activeItems.length > 0 && !isCooking;

  const vibe = useMemo(() => ({
    heatLabel: heat <= 3 ? "Low" : heat <= 7 ? "Medium" : "High",
    mood: heat >= 9 ? "🔥🔥🔥" : heat <= 2 ? "💤" : "✨"
  }), [heat]);

  function addItem(emoji) {
    setDish(null);
    setActiveItems(arr => [...arr, emoji]);
  }
  function removeItem(index) {
    setDish(null);
    setActiveItems(arr => arr.filter((_,i)=>i!==index));
  }
  function clearCookware() {
    setDish(null);
    setActiveItems([]);
  }

  async function cook() {
    if (!canCook) return;
    setIsCooking(true);
    // USD animation time
    await new Promise(r => setTimeout(r, 1200));

    // burn/undercook logic
    if (heat >= 9) {
      setDish({ emoji: "🗯️", name: "Burnt! Try lower heat." });
    } else if (heat <= 1) {
      setDish({ emoji: "❄️", name: "Undercooked… more heat!" });
    } else {
      const found = matchRecipe(selectedCookware, activeItems, customRecipes);
      if (found) setDish(found.result);
      else {
        const defaultName = generateDefaultName(activeItems, vibe.heatLabel);
        if (selectedCookware === "pan") setDish({ emoji: "🥘", name: defaultName });
        else setDish({ emoji: "🍲", name: defaultName });
      }
    }
    setIsCooking(false);
  }

  function saveCustomRecipe() {
    if (!customName.trim()) return;
    const base = { cookware: selectedCookware, items: activeItems.slice(), result: { emoji: "⭐", name: customName.trim() } };
    setCustomRecipes(list => [...list, base]);
    setCustomName("");
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-amber-50 to-orange-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <motion.span initial={{ rotate: -10 }} animate={{ rotate: 10 }} transition={{ repeat: Infinity, repeatType: "reverse", duration: 1.5 }} className="text-3xl">🍳</motion.span>
            <h1 className="text-3xl md:text-4xl font-bold">Emoji Kitchen</h1>
            <Badge className="ml-2 text-xs">Cook with Emojis</Badge>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <ChefHat className="h-5 w-5" />
            <span className="font-medium">Heat:</span>
            <span>{vibe.heatLabel} {vibe.mood}</span>
          </div>
        </header>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Pantry */}
          <Card className="md:col-span-1 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">Pantry <Badge variant="secondary">{EMOJI_PANTRY.length}</Badge></CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-8 gap-2">
                {EMOJI_PANTRY.map((e) => (
                  <Button key={e} variant="secondary" className="h-10 text-xl" onClick={() => addItem(e)}>
                    {e}
                  </Button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-3">Tip: click an emoji to add it to the selected cookware.</p>
            </CardContent>
          </Card>

          {/* Cookware */}
          <Card className="md:col-span-2 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {COOKWARES.map(cw => (
                    <Button key={cw.id} variant={selectedCookware===cw.id?"default":"outline"} onClick={()=>setSelectedCookware(cw.id)} className="rounded-2xl">
                      {cw.icon}
                      <span className="ml-2">{cw.name}</span>
                    </Button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" onClick={clearCookware} title="Clear">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4">
                {/* Heat control */}
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={()=> setHeat(h => Math.max(0, h-1))}><Minus className="h-4 w-4"/></Button>
                  <div className="flex-1 h-3 rounded-full bg-amber-200 relative overflow-hidden">
                    <motion.div className="absolute inset-y-0 left-0 bg-amber-500" style={{ width: `${(heat/10)*100}%` }} />
                  </div>
                  <Button variant="outline" onClick={()=> setHeat(h => Math.min(10, h+1))}><Plus className="h-4 w-4"/></Button>
                  <Button variant="ghost" onClick={()=> setHeat(5)} title="Reset heat"><TimerReset className="h-4 w-4"/></Button>
                </div>

                {/* Active items list */}
                <div className="rounded-2xl border p-4 bg-white/70">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-sm text-muted-foreground">In the {selectedCookware}:</div>
                    <div className="text-xs text-muted-foreground">click to remove</div>
                  </div>
                  <div className="flex flex-wrap gap-2 min-h-[44px]">
                    {activeItems.length === 0 && (
                      <span className="text-muted-foreground">(empty)</span>
                    )}
                    {activeItems.map((e, i) => (
                      <Button key={`${e}-${i}`} variant="secondary" className="h-10 text-xl" onClick={() => removeItem(i)} title="Remove">
                        {e}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Cook button and animation */}
                <div className="flex items-center gap-3">
                  <Button size="lg" onClick={cook} disabled={!canCook} className="text-base">
                    <Flame className="h-4 w-4 mr-2"/>
                    Cook
                  </Button>
                  <AnimatePresence>
                    {isCooking && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} className="text-2xl select-none">
                        {selectedCookware === "pan" ? "♨️💥 Sizzle..." : "💨🍲 Boiling..."}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Result */}
                <AnimatePresence>
                  {dish && (
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="rounded-2xl border p-6 bg-amber-50">
                      <div className="flex items-center gap-3">
                        <div className="text-4xl">{dish.emoji}</div>
                        <div>
                          <div className="font-semibold text-lg">{dish.name}</div>
                          <div className="text-xs text-muted-foreground">Heat: {heat} ({vibe.heatLabel})</div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Custom recipe saver */}
                <div className="rounded-2xl border p-4 bg-white/70">
                  <div className="flex flex-col md:flex-row md:items-center gap-2">
                    <Input placeholder="Name your creation (e.g., 'Ultimate Noods')" value={customName} onChange={e=>setCustomName(e.target.value)} />
                    <Button onClick={saveCustomRecipe} disabled={!customName.trim() || activeItems.length===0}>
                      <Save className="h-4 w-4 mr-2"/>Save as Recipe
                    </Button>
                  </div>
                  {customRecipes.length>0 && (
                    <div className="mt-3">
                      <div className="text-sm font-medium mb-2 flex items-center gap-2"><Wand2 className="h-4 w-4"/> Your Saved Recipes</div>
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        {customRecipes.map((r, idx) => (
                          <div key={idx} className="flex items-center justify-between rounded-xl border p-2 bg-white">
                            <div className="text-2xl mr-2">{r.result.emoji}</div>
                            <div className="flex-1">
                              <div className="text-sm font-semibold">{r.result.name}</div>
                              <div className="text-xs text-muted-foreground">{r.cookware} • {r.items.join(" ")}</div>
                            </div>
                            <Button size="sm" variant="outline" onClick={()=>{
                              setSelectedCookware(r.cookware);
                              if (r.cookware === "pan") setPanItems(r.items.slice());
                              else setPotItems(r.items.slice());
                              setDish(null);
                            }}>Cook</Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </CardContent>
          </Card>
        </div>
        
</div>
</div>
  )}
