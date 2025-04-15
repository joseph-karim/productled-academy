import React, { useState } from 'react';
import { useOfferStore } from '../store/offerStore';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Trash2, PlusCircle, CheckCircle } from 'lucide-react';

interface AddEnhancersProps {
  modelData?: any;
  readOnly?: boolean;
}

interface Bonus {
  id: string;
  name: string;
  benefit: string;
}

export function AddEnhancers({ readOnly = false }: AddEnhancersProps) {
  const {
    exclusivity,
    setExclusivity,
    bonuses,
    addBonus,
    removeBonus,
    setBonuses, // Assuming you add setBonuses action to store for updating existing bonuses
    enhancersConfirmed,
    setEnhancersConfirmed
  } = useOfferStore();

  const [currentBonusName, setCurrentBonusName] = useState('');
  const [currentBonusBenefit, setCurrentBonusBenefit] = useState('');

  const handleExclusivityChange = (field: keyof typeof exclusivity, value: string | boolean) => {
    if (readOnly) return;
    setExclusivity({ ...exclusivity, [field]: value });
  };

  const handleAddBonus = () => {
    if (readOnly || !currentBonusName.trim() || !currentBonusBenefit.trim()) return;
    // Assuming addBonus in store handles creating an object with ID
    addBonus({
      id: crypto.randomUUID(),
      name: currentBonusName.trim(),
      benefit: currentBonusBenefit.trim()
    });
    setCurrentBonusName('');
    setCurrentBonusBenefit('');
  };

  // Function to update an existing bonus (requires setBonuses or similar in store)
  const handleUpdateBonus = (index: number, field: 'name' | 'benefit', value: string) => {
    if (readOnly) return;
    const updatedBonuses = [...bonuses];
    updatedBonuses[index] = { ...updatedBonuses[index], [field]: value };
    setBonuses(updatedBonuses); // Use the store action to update the whole array
  };

  const handleRemoveBonus = (index: number) => {
    if (readOnly) return;
    removeBonus(index);
  };

  const handleConfirm = () => {
    if (!readOnly) {
      setEnhancersConfirmed(true);
    }
  };

  return (
    <div className="space-y-8">
      <Card className="bg-[#2A2A2A] border-[#333333] text-white">
        <CardHeader>
          <CardTitle>Add Offer Enhancers (Optional)</CardTitle>
          <CardDescription className="text-gray-400">Layer scarcity and added value onto your core offer. These enhancers are optional but can make your offer more compelling.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Exclusivity Section */}
          <div className="space-y-4 p-4 border border-[#444444] rounded-md bg-[#1C1C1C]">
            <h3 className="font-semibold text-gray-200">Exclusivity / Scarcity</h3>
            <div>
              <Label className="text-gray-300">Is there a limit to how many people you can serve?</Label>
              <RadioGroup
                value={exclusivity.hasLimit ? 'yes' : 'no'}
                onValueChange={(value: string) => handleExclusivityChange('hasLimit', value === 'yes')}
                className="flex space-x-4 mt-2"
                disabled={readOnly || enhancersConfirmed}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="limit-yes" />
                  <Label htmlFor="limit-yes" className="text-gray-300">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="limit-no" />
                  <Label htmlFor="limit-no" className="text-gray-300">No</Label>
                </div>
              </RadioGroup>
            </div>
            {exclusivity.hasLimit && (
              <div className="space-y-4 pl-6 border-l-2 border-gray-600 ml-2">
                <div>
                  <Label htmlFor="capacityLimit" className="text-gray-300">Capacity Limit</Label>
                  <Input
                    id="capacityLimit"
                    value={exclusivity.capacityLimit}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleExclusivityChange('capacityLimit', e.target.value)}
                    placeholder="e.g., 'Only 50 spots available'"
                    disabled={readOnly || enhancersConfirmed}
                    className="mt-1 bg-[#1C1C1C] border-[#333333] text-white placeholder:text-gray-500"
                  />
                </div>
                <div>
                  <Label htmlFor="validReason" className="text-gray-300">Valid Reason for Limit</Label>
                  <Textarea
                    id="validReason"
                    value={exclusivity.validReason}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleExclusivityChange('validReason', e.target.value)}
                    placeholder="e.g., 'To ensure personalized attention'"
                    disabled={readOnly || enhancersConfirmed}
                    className="mt-1 bg-[#1C1C1C] border-[#333333] text-white placeholder:text-gray-500"
                    rows={2}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Bonuses Section */}
          <div className="space-y-4 p-4 border border-[#444444] rounded-md bg-[#1C1C1C]">
            <h3 className="font-semibold text-gray-200">Bonuses (Optional)</h3>
            <p className="text-sm text-gray-400">List 1-3 key bonuses and their primary benefit.</p>

            {bonuses.map((bonus, index) => (
              <div key={bonus.id || index} className="flex items-start space-x-2 p-3 bg-[#2A2A2A] rounded border border-[#444444]">
                <div className="flex-1 space-y-2">
                   <Input
                    value={bonus.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleUpdateBonus(index, 'name', e.target.value)}
                    placeholder="Bonus Name (e.g., Quick Start Guide)"
                    disabled={readOnly || enhancersConfirmed}
                    className="bg-[#1C1C1C] border-[#333333] text-white placeholder:text-gray-500"
                  />
                  <Textarea
                    value={bonus.benefit}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleUpdateBonus(index, 'benefit', e.target.value)}
                    placeholder="Primary Benefit (e.g., 'Get results in half the time')"
                    disabled={readOnly || enhancersConfirmed}
                    className="bg-[#1C1C1C] border-[#333333] text-white placeholder:text-gray-500"
                    rows={2}
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveBonus(index)}
                  disabled={readOnly || enhancersConfirmed}
                  className="text-red-500 hover:text-red-400 mt-1"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}

            {!enhancersConfirmed && bonuses.length < 3 && (
              <div className="flex items-start space-x-2 pt-4 border-t border-gray-600">
                 <div className="flex-1 space-y-2">
                   <Input
                      value={currentBonusName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCurrentBonusName(e.target.value)}
                      placeholder="New Bonus Name"
                      disabled={readOnly}
                      className="bg-[#1C1C1C] border-[#333333] text-white placeholder:text-gray-500"
                    />
                    <Textarea
                      value={currentBonusBenefit}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCurrentBonusBenefit(e.target.value)}
                      placeholder="Benefit of this bonus"
                      disabled={readOnly}
                      className="bg-[#1C1C1C] border-[#333333] text-white placeholder:text-gray-500"
                      rows={2}
                    />
                 </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleAddBonus}
                  disabled={readOnly || !currentBonusName.trim() || !currentBonusBenefit.trim()}
                  className="mt-1 text-gray-300 border-[#444444] hover:bg-[#333333]"
                >
                  <PlusCircle className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          {!enhancersConfirmed && (
            <Button
              onClick={handleConfirm}
              disabled={readOnly}
              className="bg-[#FFD23F] text-[#1C1C1C] hover:bg-opacity-90"
            >
              Confirm Enhancers & Continue
            </Button>
          )}
          {enhancersConfirmed && (
            <p className="text-green-400 text-sm font-medium flex items-center">
              <CheckCircle className="w-4 h-4 mr-1" /> Enhancers Confirmed. You can proceed to the next step.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}