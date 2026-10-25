import { Bell, Clock, Smartphone, Info } from 'lucide-react';

export function AdminSettingsPage() {
  return (
    <div className="animate-fade-in space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-[#26352E]">Settings</h1>
        <p className="text-sm text-[#788078] mt-1">
          Configure reminders, consultation duration, and notification preferences.
        </p>
      </div>

      {/* Demo notice */}
      <div className="flex items-start gap-3 p-4 bg-[#F0E9DD] rounded-xl border border-[#E0D4C5]">
        <Info size={16} className="text-[#C38C43] flex-shrink-0 mt-0.5" aria-hidden="true" />
        <p className="text-sm text-[#788078]">
          <strong className="text-[#26352E]">Demo mode:</strong> Settings are displayed for reference only. Changes here are not persisted in this demo. A production implementation would save these to the database.
        </p>
      </div>

      {/* Consultation duration */}
      <div className="card p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#E7EDE4] flex items-center justify-center">
            <Clock size={18} className="text-[#718B73]" aria-hidden="true" />
          </div>
          <div>
            <h2 className="font-bold text-[#26352E]">Consultation duration</h2>
            <p className="text-sm text-[#788078]">Default slot length</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <select
            defaultValue="30"
            disabled
            aria-label="Consultation duration"
            className="px-4 py-2.5 rounded-xl border border-[#E8E7DF] text-sm text-[#26352E] bg-[#F8F7F2] opacity-70"
          >
            <option value="30">30 minutes</option>
            <option value="45">45 minutes</option>
            <option value="60">60 minutes</option>
          </select>
          <span className="text-xs text-[#788078]">(saved in database)</span>
        </div>
      </div>

      {/* Reminders */}
      <div className="card p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#E7EDE4] flex items-center justify-center">
            <Bell size={18} className="text-[#718B73]" aria-hidden="true" />
          </div>
          <div>
            <h2 className="font-bold text-[#26352E]">Reminder schedule</h2>
            <p className="text-sm text-[#788078]">When reminders are sent to clients</p>
          </div>
        </div>

        <div className="space-y-3">
          {[
            { label: '24 hours before', description: 'Day-before reminder', active: true },
            { label: '2 hours before', description: 'Same-day reminder', active: true },
          ].map(reminder => (
            <div key={reminder.label} className="flex items-center justify-between p-3 bg-[#F8F7F2] rounded-xl">
              <div>
                <p className="text-sm font-semibold text-[#26352E]">{reminder.label}</p>
                <p className="text-xs text-[#788078]">{reminder.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#438765]" aria-hidden="true" />
                <span className="text-xs font-semibold text-[#438765]">Enabled</span>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 bg-[#FFFBEB] border border-amber-100 rounded-xl">
          <div className="flex items-start gap-2">
            <Smartphone size={14} className="text-[#C38C43] flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p className="text-xs font-bold text-[#26352E]">Simulated reminders</p>
              <p className="text-xs text-[#788078] mt-1 leading-relaxed">
                In this demo, reminders are logged to the <code>reminder_logs</code> table with status "simulated". No actual SMS or WhatsApp messages are sent. To enable real delivery, integrate a provider such as Twilio, Gupshup, or WhatsApp Business API and update the <code>delivery_status</code> field.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Nutritionist profile */}
      <div className="card p-6 space-y-4">
        <h2 className="font-bold text-[#26352E]">Nutritionist profile</h2>
        <div className="space-y-3">
          <div>
            <p className="text-xs text-[#788078] font-medium mb-1">Name</p>
            <p className="text-sm font-semibold text-[#26352E]">Dr. Priya Sharma</p>
          </div>
          <div>
            <p className="text-xs text-[#788078] font-medium mb-1">Email</p>
            <p className="text-sm font-semibold text-[#26352E]">priya.sharma@kayro.health</p>
          </div>
        </div>
      </div>
    </div>
  );
}
