

import React from 'react';
import { CharacterProfile, CharacterGender, WorldSettings } from '../../types';
import { FormInput, FormSelect, FormTextArea, FormLabel } from './common';

interface CharacterTabProps {
    profile: CharacterProfile;
    worldSettings: WorldSettings;
    handleProfileChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
    startingLevelOrRealm: string;
    setStartingLevelOrRealm: (value: string) => void;
    error: string;
}

export const CharacterTab: React.FC<CharacterTabProps> = ({ profile, worldSettings, handleProfileChange, startingLevelOrRealm, setStartingLevelOrRealm, error }) => (
    <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <div>
                <FormLabel htmlFor="name">Tên Nhân Vật</FormLabel>
                <FormInput id="name" name="name" value={profile.name} onChange={handleProfileChange} required />
                {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
            </div>
             <div>
                <FormLabel htmlFor="gender">Giới tính</FormLabel>
                <FormSelect id="gender" name="gender" value={profile.gender} onChange={handleProfileChange}>
                    <option value={CharacterGender.MALE}>Nam</option>
                    <option value={CharacterGender.FEMALE}>Nữ</option>
                </FormSelect>
            </div>
             <div>
                <FormLabel htmlFor="race">Chủng Tộc (Lore)</FormLabel>
                <FormInput id="race" name="race" value={profile.race} onChange={handleProfileChange} placeholder="Ví dụ: Nhân Tộc, Ma Tộc, Yêu Tộc..." />
            </div>
            <div>
                <FormLabel htmlFor="powerSystem">Hệ Thống Sức Mạnh</FormLabel>
                <FormSelect id="powerSystem" name="powerSystem" value={profile.powerSystem} onChange={handleProfileChange}>
                   {worldSettings.powerSystems && worldSettings.powerSystems.filter(s => s && s.id && s.name.trim()).map(system => (
                       <option key={system.id} value={system.name}>{system.name}</option>
                    ))}
                </FormSelect>
            </div>
        </div>
         <div>
            <FormLabel htmlFor="appearance">Ngoại Hình</FormLabel>
            <FormTextArea id="appearance" name="appearance" value={profile.appearance} onChange={handleProfileChange} />
        </div>
         <div>
            <FormLabel htmlFor="startingLevelOrRealm">Cảnh Giới Khởi Đầu (Tùy chọn)</FormLabel>
            <FormInput
                id="startingLevelOrRealm"
                name="startingLevelOrRealm"
                value={startingLevelOrRealm}
                onChange={(e) => setStartingLevelOrRealm(e.target.value)}
                placeholder="Nhập cấp độ hoặc tên cảnh giới (Vd: Luyện Khí Nhất Trọng)"
            />
             <p className="text-xs text-slate-400 mt-1">Để trống sẽ mặc định theo cấp độ hiện tại của nhân vật (thường là 1).</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <div>
                <FormLabel htmlFor="currencyName">Tên Tiền Tệ</FormLabel>
                <FormInput id="currencyName" name="currencyName" value={profile.currencyName} onChange={handleProfileChange} />
            </div>
            <div>
                <FormLabel htmlFor="currencyAmount">Số Tiền Khởi Đầu</FormLabel>
                <FormInput id="currencyAmount" name="currencyAmount" type="number" value={profile.currencyAmount} onChange={handleProfileChange} />
            </div>
        </div>
        <div>
            <FormLabel htmlFor="personality">Tính cách</FormLabel>
            <FormTextArea id="personality" name="personality" value={profile.personality} onChange={handleProfileChange} />
        </div>
        <div>
            <FormLabel htmlFor="backstory">Tiểu sử</FormLabel>
            <FormTextArea id="backstory" name="backstory" value={profile.backstory} onChange={handleProfileChange} />
        </div>
        <div>
            <FormLabel htmlFor="goal">Mục tiêu</FormLabel>
            <FormTextArea id="goal" name="goal" value={profile.goal} onChange={handleProfileChange} />
        </div>
        <div>
            <FormLabel htmlFor="sc-name">Thể Chất Đặc Biệt (Tên)</FormLabel>
            <FormInput id="sc-name" name="specialConstitution.name" value={profile.specialConstitution.name} onChange={handleProfileChange} />
        </div>
        <div>
            <FormLabel htmlFor="sc-desc">Thể Chất Đặc Biệt (Mô tả)</FormLabel>
            <FormTextArea id="sc-desc" name="specialConstitution.description" value={profile.specialConstitution.description} onChange={handleProfileChange} />
        </div>
        <div>
            <FormLabel htmlFor="t-name">Thiên Phú (Tên)</FormLabel>
            <FormInput id="t-name" name="talent.name" value={profile.talent.name} onChange={handleProfileChange} />
        </div>
        <div>
            <FormLabel htmlFor="t-desc">Thiên Phú (Mô tả)</FormLabel>
            <FormTextArea id="t-desc" name="talent.description" value={profile.talent.description} onChange={handleProfileChange} />
        </div>
    </div>
);