import React, { useState, useMemo, useEffect } from 'react';
import { CharacterProfile, NPC, Choice, Location } from '../../../types';
import { getDefaultAvatar } from '../../../utils/uiHelpers';
import { RulesEditor } from './shared/RulesEditor';
import { FormInput, FormTextArea } from '../../worldSetup/common';


interface HaremTabProps {
    profile: CharacterProfile;
    npcs: NPC[];
    onUpdateLocation: (location: Location) => void;
    onAction: (choice: Choice) => void;
    onClose: () => void;
}

const HAREM_ESTABLISH_COST = 10000;

type ConfirmAction = 
    | { type: 'establish'; locationId: string; locationName: string; }
    | { type: 'add'; npcId: string; npcName: string; }
    | { type: 'remove'; npc: NPC; };

const ConfirmationDialog: React.FC<{ message: React.ReactNode; onConfirm: () => void; onCancel: () => void; }> = ({ message, onConfirm, onCancel }) => (
    <div className="p-4 bg-slate-900/50 rounded-lg border border-amber-500/50 space-y-4 animate-fade-in">
        <p className="text-slate-200 text-center">{message}</p>
        <div className="flex justify-center gap-4">
            <button onClick={onCancel} className="px-6 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors">Hủy</button>
            <button onClick={onConfirm} className="px-6 py-2 rounded-lg bg-red-600 text-white font-bold hover:bg-red-500 transition-colors">Xác nhận</button>
        </div>
    </div>
);


export const HaremTab: React.FC<HaremTabProps> = ({ profile, npcs, onUpdateLocation, onAction, onClose }) => {
    const [selectedLocationId, setSelectedLocationId] = useState('');
    const [selectedNpcId, setSelectedNpcId] = useState('');
    const [confirmingAction, setConfirmingAction] = useState<ConfirmAction | null>(null);
    
    // State for Harem Status Effect editor
    const [statusName, setStatusName] = useState('');
    const [statusDescription, setStatusDescription] = useState('');

    const haremPalace = useMemo(() => profile.discoveredLocations.find(loc => loc.isHaremPalace), [profile.discoveredLocations]);
    
    // Parse existing rules to populate status effect editor
    useEffect(() => {
        if (haremPalace) {
            const enterRuleRegex = /Khi tiến vào, nhận trạng thái '([^']*)' \(([^)]*)\)/;
            const leaveRuleRegex = /Khi rời đi, mất trạng thái '([^']*)'/;

            const enterRule = haremPalace.rules.find(rule => enterRuleRegex.test(rule));

            if (enterRule) {
                const match = enterRule.match(enterRuleRegex);
                if (match) {
                    setStatusName(match[1]);
                    setStatusDescription(match[2]);
                    return;
                }
            }
            
            // Fallback to leave rule if enter rule is malformed
            const leaveRule = haremPalace.rules.find(rule => leaveRuleRegex.test(rule));
            if (leaveRule) {
                const match = leaveRule.match(leaveRuleRegex);
                if(match) setStatusName(match[1]);
            }
        }
    }, [haremPalace]);

    
    const ownedLocations = useMemo(() => profile.discoveredLocations.filter(loc => loc.ownerId === profile.id && !loc.isDestroyed), [profile.discoveredLocations, profile.id]);

    const haremMembers = useMemo(() => {
        if (!haremPalace) return [];
        return npcs.filter(npc => npc.locationId === haremPalace.id && !npc.isDead);
    }, [npcs, haremPalace]);

    const daoluCandidates = useMemo(() => {
        return npcs.filter(npc => npc.isDaoLu && npc.locationId !== haremPalace?.id && !npc.isDead);
    }, [npcs, haremPalace]);

    const handleEstablishHarem = () => {
        if (!selectedLocationId) {
            alert("Vui lòng chọn một địa điểm.");
            return;
        }
        if (profile.currencyAmount < HAREM_ESTABLISH_COST) {
            alert(`Không đủ ${profile.currencyName}. Cần ${HAREM_ESTABLISH_COST.toLocaleString()}.`);
            return;
        }
        const locationName = ownedLocations.find(l => l.id === selectedLocationId)?.name || 'địa điểm đã chọn';
        setConfirmingAction({ type: 'establish', locationId: selectedLocationId, locationName });
    };

    const handleAddMember = () => {
        if (!selectedNpcId) {
            alert("Vui lòng chọn một đạo lữ để mời.");
            return;
        }
        const npcName = daoluCandidates.find(n => n.id === selectedNpcId)?.name || 'người được chọn';
        setConfirmingAction({ type: 'add', npcId: selectedNpcId, npcName });
    };
    
    const handleRemoveMember = (npc: NPC) => {
        setConfirmingAction({ type: 'remove', npc });
    };

    const executeConfirmation = () => {
        if (!confirmingAction) return;

        let choice: Choice;

        switch (confirmingAction.type) {
            case 'establish':
                choice = {
                    title: `(Hệ thống) Thiết lập hậu cung tại địa điểm ID: ${confirmingAction.locationId}`,
                    benefit: "Có một nơi ở riêng tư và an toàn cho các đạo lữ.",
                    risk: `Tốn ${HAREM_ESTABLISH_COST.toLocaleString()} ${profile.currencyName}.`,
                    durationInMinutes: 60,
                    successChance: 100,
                };
                onAction(choice);
                onClose();
                break;
            case 'add':
                choice = {
                    title: `(Hệ thống) Mời ${confirmingAction.npcName} (ID: ${confirmingAction.npcId}) vào Hậu Cung.`,
                    benefit: `Mời ${confirmingAction.npcName} chuyển đến sống tại Hậu Cung.`,
                    risk: "Thay đổi vị trí của NPC.",
                    durationInMinutes: 30,
                    successChance: 100,
                };
                onAction(choice);
                setSelectedNpcId('');
                break;
            case 'remove':
                choice = {
                    title: `(Hệ thống) Trục xuất ${confirmingAction.npc.name} (ID: ${confirmingAction.npc.id}) khỏi Hậu Cung.`,
                    benefit: `Yêu cầu ${confirmingAction.npc.name} rời khỏi Hậu Cung.`,
                    risk: "Có thể làm giảm hảo cảm.",
                    durationInMinutes: 15,
                    successChance: 100,
                };
                onAction(choice);
                break;
        }

        setConfirmingAction(null);
    };

    const getConfirmationMessage = (): React.ReactNode => {
        if (!confirmingAction) return null;
        switch (confirmingAction.type) {
            case 'establish':
                return <>Bạn có chắc muốn chi <b className="text-yellow-400">{HAREM_ESTABLISH_COST.toLocaleString()} {profile.currencyName}</b> để thiết lập <b className="text-amber-300">"{confirmingAction.locationName}"</b> làm Hậu Cung?</>;
            case 'add':
                return <>Bạn có chắc muốn mời <b className="text-amber-300">{confirmingAction.npcName}</b> vào Hậu Cung không?</>;
            case 'remove':
                return <>Bạn có chắc muốn yêu cầu <b className="text-amber-300">{confirmingAction.npc.name}</b> rời khỏi Hậu Cung không?</>;
            default:
                return "Bạn có chắc chắn?";
        }
    };

    const getGeneralRules = (rules: string[]): string[] => {
        return rules.filter(rule => 
            !rule.startsWith("Khi tiến vào, nhận trạng thái") && 
            !rule.startsWith("Khi rời đi, mất trạng thái")
        );
    };
    
    const handleSaveStatus = () => {
        if (!haremPalace) return;

        const generalRules = getGeneralRules(haremPalace.rules);
        let newRules = [...generalRules];

        if (statusName.trim()) {
            newRules.push(`Khi tiến vào, nhận trạng thái '${statusName.trim()}' (${statusDescription.trim()})`);
            newRules.push(`Khi rời đi, mất trạng thái '${statusName.trim()}'`);
        }
        
        onUpdateLocation({ ...haremPalace, rules: newRules });
        alert("Đã cập nhật trạng thái Hậu Cung!");
    };
    
    const handleUpdateGeneralRules = (newGeneralRules: string[]) => {
        if (!haremPalace) return;
        
        let newRules = [...newGeneralRules];

        if (statusName.trim()) {
            newRules.push(`Khi tiến vào, nhận trạng thái '${statusName.trim()}' (${statusDescription.trim()})`);
            newRules.push(`Khi rời đi, mất trạng thái '${statusName.trim()}'`);
        }
        
        onUpdateLocation({ ...haremPalace, rules: newRules });
    };

    if (!haremPalace) {
        return (
            <div className="space-y-6">
                <h3 className="text-xl font-bold text-amber-300 border-b border-slate-700 pb-2">Thành Lập Hậu Cung</h3>
                <p className="text-sm text-slate-400">Chọn một trong các địa điểm bạn sở hữu để thiết lập làm Hậu Cung. Đây sẽ là nơi ở riêng tư và an toàn cho các Đạo Lữ của bạn.</p>
                {ownedLocations.length > 0 ? (
                    <div className="space-y-4">
                        {confirmingAction?.type === 'establish' ? (
                            <ConfirmationDialog
                                message={getConfirmationMessage()}
                                onConfirm={executeConfirmation}
                                onCancel={() => setConfirmingAction(null)}
                            />
                        ) : (
                            <>
                                <div>
                                    <label htmlFor="location-select" className="block text-sm font-medium text-slate-300 mb-1">Chọn Địa Điểm</label>
                                    <select
                                        id="location-select"
                                        value={selectedLocationId}
                                        onChange={(e) => setSelectedLocationId(e.target.value)}
                                        className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400"
                                    >
                                        <option value="">-- Chọn một địa điểm --</option>
                                        {ownedLocations.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
                                    </select>
                                </div>
                                <p className="text-sm text-slate-500">
                                    Chi phí thiết lập: <span className="font-bold text-yellow-400">{HAREM_ESTABLISH_COST.toLocaleString()} {profile.currencyName}</span>.
                                    Bạn đang có: <span className="font-bold text-yellow-400">{profile.currencyAmount.toLocaleString()}</span>.
                                </p>
                                <button
                                    onClick={handleEstablishHarem}
                                    disabled={!selectedLocationId || profile.currencyAmount < HAREM_ESTABLISH_COST}
                                    className="w-full py-3 bg-amber-600 text-slate-900 font-bold rounded-lg hover:bg-amber-500 transition-colors disabled:opacity-50"
                                >
                                    Thiết Lập Hậu Cung
                                </button>
                            </>
                        )}
                    </div>
                ) : (
                    <div className="text-center py-10 bg-slate-900/50 rounded-lg">
                        <p className="text-slate-500">Bạn chưa sở hữu địa điểm nào để có thể thiết lập Hậu Cung.</p>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-xl font-bold text-amber-300 border-b border-slate-700 pb-2">Quản Lý Hậu Cung</h3>
                <p className="text-sm text-slate-400 mt-2">Địa điểm: <span className="font-semibold text-white">{haremPalace.name}</span></p>
            </div>
            
            <div className="space-y-3">
                <h4 className="text-lg font-semibold text-slate-200">Thành viên ({haremMembers.length})</h4>
                 <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                    {haremMembers.length > 0 ? (
                        haremMembers.map(npc => (
                            <div key={npc.id} className="flex items-center p-2 bg-slate-900/50 rounded-lg justify-between">
                                <div className="flex items-center gap-3">
                                    <img src={npc.avatarUrl || getDefaultAvatar(npc.gender)} alt={npc.name} className="w-10 h-10 rounded-full object-cover"/>
                                    <div>
                                        <p className="font-semibold text-slate-100">{npc.name}</p>
                                        <p className="text-xs text-slate-400">{npc.realm}</p>
                                    </div>
                                </div>
                                {confirmingAction?.type === 'remove' && confirmingAction.npc.id === npc.id ? (
                                     <ConfirmationDialog
                                        message={getConfirmationMessage()}
                                        onConfirm={executeConfirmation}
                                        onCancel={() => setConfirmingAction(null)}
                                    />
                                ) : (
                                    <button onClick={() => handleRemoveMember(npc)} className="px-3 py-1 bg-red-800 text-white text-xs font-bold rounded hover:bg-red-700 transition-colors">Trục xuất</button>
                                )}
                            </div>
                        ))
                    ) : (
                        <p className="text-slate-500 text-center py-4">Chưa có thành viên nào.</p>
                    )}
                </div>
            </div>

            <div className="border-t border-slate-700 pt-4 space-y-3">
                 <h4 className="text-lg font-semibold text-slate-200">Mời Đạo Lữ</h4>
                 {daoluCandidates.length > 0 ? (
                     confirmingAction?.type === 'add' ? (
                          <ConfirmationDialog
                            message={getConfirmationMessage()}
                            onConfirm={executeConfirmation}
                            onCancel={() => setConfirmingAction(null)}
                        />
                     ) : (
                         <div className="flex items-center gap-3">
                            <select
                                value={selectedNpcId}
                                onChange={(e) => setSelectedNpcId(e.target.value)}
                                className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400"
                            >
                                <option value="">-- Chọn một đạo lữ --</option>
                                {daoluCandidates.map(npc => <option key={npc.id} value={npc.id}>{npc.name}</option>)}
                            </select>
                            <button onClick={handleAddMember} disabled={!selectedNpcId} className="px-5 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-500 transition-colors disabled:opacity-50 flex-shrink-0">Mời</button>
                         </div>
                     )
                 ) : (
                     <p className="text-slate-500 text-center py-4">Không có đạo lữ nào khác để mời.</p>
                 )}
            </div>

            {/* Status Effect Editor */}
            <div className="border-t border-slate-700 pt-4 space-y-3">
                <h4 className="text-lg font-semibold text-slate-200">Trạng Thái Hậu Cung</h4>
                <p className="text-xs text-slate-400">Định nghĩa trạng thái sẽ được tự động áp dụng cho các nhân vật khi họ tiến vào Hậu Cung.</p>
                <div>
                    <label className="text-sm font-medium text-slate-300 mb-1 block">Tên Trạng Thái</label>
                    <FormInput
                        value={statusName}
                        onChange={(e) => setStatusName(e.target.value)}
                        placeholder="Vd: Siêu Hậu Cung"
                    />
                </div>
                 <div>
                    <label className="text-sm font-medium text-slate-300 mb-1 block">Mô Tả Trạng Thái</label>
                    <FormTextArea
                        value={statusDescription}
                        onChange={(e) => setStatusDescription(e.target.value)}
                        placeholder="Vd: Tuyệt đối trung thành với phu quân, không mặc y phục."
                        rows={3}
                    />
                </div>
                <button onClick={handleSaveStatus} className="w-full py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-500 transition-colors">Lưu Thay Đổi Trạng Thái</button>
            </div>
            
            {/* Additional Rules Editor */}
            <RulesEditor
                rules={getGeneralRules(haremPalace.rules)}
                onUpdateRules={handleUpdateGeneralRules}
                title="Luật Lệ Bổ Sung"
                description="Thêm các luật lệ mang tính mô tả, không ảnh hưởng trực tiếp đến cơ chế game (vd: 'Linh khí ở đây dày đặc gấp trăm lần bên ngoài')."
                placeholder="Thêm luật lệ mô tả..."
            />
        </div>
    );
};