import React from 'react';
import { User, Phone, Calendar, HeartHandshake, Edit2, Trash2, CheckCircle2 } from 'lucide-react';

export default function PatientProfileCard({
  profile,
  isSelected = false,
  onSelect = null,
  onEdit = null,
  onDelete = null,
  isSelectable = false,
}) {
  const isSelf = profile.relationship === 'Bản thân';

  return (
    <div
      onClick={isSelectable && onSelect ? () => onSelect(profile) : undefined}
      className={`relative p-5 rounded-2xl border transition-all duration-200 ${
        isSelectable ? 'cursor-pointer' : ''
      } ${
        isSelected
          ? 'border-sky-500 bg-sky-50/70 shadow-md shadow-sky-500/10 ring-2 ring-sky-500'
          : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Profile Info */}
        <div className="flex items-start gap-3.5">
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 font-bold text-sm shadow-xs ${
              isSelf
                ? 'bg-sky-100 text-sky-700'
                : 'bg-indigo-100 text-indigo-700'
            }`}
          >
            <User className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-base font-bold text-slate-900">{profile.fullName}</h4>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                  isSelf
                    ? 'bg-sky-100 text-sky-800'
                    : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                }`}
              >
                {profile.relationship || 'Người thân'}
              </span>
            </div>

            {/* Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 mt-2.5 text-xs text-slate-600">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  Ngày sinh: <strong className="text-slate-700 font-semibold">{profile.dob}</strong>
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 font-bold text-xs">Giới tính:</span>
                <span className="font-semibold text-slate-700">{profile.gender}</span>
              </div>
              <div className="flex items-center gap-1.5 sm:col-span-2">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  SĐT: <strong className="text-slate-700 font-semibold">{profile.phone}</strong>
                </span>
              </div>
              {profile.address && (
                <div className="text-[11px] text-slate-500 sm:col-span-2 truncate">
                  Địa chỉ: {profile.address}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Selection or Action Buttons */}
        <div className="shrink-0 flex items-center gap-1">
          {isSelectable ? (
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                isSelected
                  ? 'bg-sky-600 text-white'
                  : 'border-2 border-slate-300 text-transparent hover:border-sky-400'
              }`}
            >
              <CheckCircle2 className="w-5 h-5 fill-current" />
            </div>
          ) : (
            <div className="flex items-center gap-1">
              {onEdit && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(profile);
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition-colors"
                  title="Chỉnh sửa hồ sơ"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              )}
              {onDelete && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(profile);
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Xóa hồ sơ"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
