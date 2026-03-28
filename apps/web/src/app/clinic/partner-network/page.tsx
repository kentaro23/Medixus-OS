"use client";

import { useState } from "react";
import {
  Network,
  FlaskConical,
  Pill,
  Send,
  Download,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Search,
  MapPin,
  Phone,
  FileText,
  X,
  ChevronRight,
  ArrowRightLeft,
  Loader2,
  PackageCheck,
} from "lucide-react";
import { labOrders, prescriptions, patients } from "@/lib/clinic-data";
import type { LabOrder, Patient } from "@/lib/clinic-data";

const labs = [
  { id: "lab-001", name: "SRLラボラトリーズ", type: "検査機関", location: "東京都新宿区", phone: "03-1111-2222", status: "connected", turnaround: "1.2日" },
  { id: "lab-002", name: "BMLクリニカル", type: "検査機関", location: "東京都渋谷区", phone: "03-3333-4444", status: "connected", turnaround: "1.5日" },
];

const pharmacies = [
  { id: "ph-001", name: "ウエルシア薬局 渋谷店", location: "東京都渋谷区道玄坂1-2-3", phone: "03-5555-6666", status: "connected" },
  { id: "ph-002", name: "日本調剤 新宿店", location: "東京都新宿区西新宿2-1-1", phone: "03-7777-8888", status: "connected" },
  { id: "ph-003", name: "スギ薬局 六本木店", location: "東京都港区六本木7-8-9", phone: "03-9999-0000", status: "pending" },
];

const orderStatusStyle: Record<string, { bg: string; text: string; label: string; icon: React.ReactNode }> = {
  ordered: { bg: "bg-blue-100", text: "text-blue-700", label: "依頼中", icon: <Loader2 size={14} className="animate-spin" /> },
  received: { bg: "bg-amber-100", text: "text-amber-700", label: "受領済", icon: <Download size={14} /> },
  "in-progress": { bg: "bg-purple-100", text: "text-purple-700", label: "検査中", icon: <Clock size={14} /> },
  completed: { bg: "bg-green-100", text: "text-green-700", label: "完了", icon: <CheckCircle2 size={14} /> },
};

function NewLabOrderModal({ onClose }: { onClose: () => void }) {
  const [selectedPatient, setSelectedPatient] = useState("");
  const [selectedLab, setSelectedLab] = useState("");
  const [selectedTests, setSelectedTests] = useState<string[]>([]);

  const availableTests = [
    "HbA1c", "空腹時血糖", "随時血糖", "CBC", "CRP", "ESR",
    "LDLコレステロール", "HDLコレステロール", "中性脂肪", "AST", "ALT", "γ-GTP",
    "Cr", "BUN", "eGFR", "尿アルブミン/Cr比", "Na/K/Cl",
    "TSH", "FT4", "BNP", "PT-INR", "HBs抗原", "HCV抗体",
  ];

  const toggleTest = (test: string) => {
    setSelectedTests((prev) =>
      prev.includes(test) ? prev.filter((t) => t !== test) : [...prev, test]
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto animate-fade-in">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <FlaskConical size={20} className="text-blue-500" /> 新規検査オーダー
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
        </div>
        <div className="p-6 space-y-5">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">患者</label>
            <select
              value={selectedPatient}
              onChange={(e) => setSelectedPatient(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30"
            >
              <option value="">患者を選択...</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>{p.name}（{p.age}歳 {p.gender}）</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">検査機関</label>
            <select
              value={selectedLab}
              onChange={(e) => setSelectedLab(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30"
            >
              <option value="">検査機関を選択...</option>
              {labs.map((l) => (
                <option key={l.id} value={l.id}>{l.name}（平均{l.turnaround}）</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              検査項目（{selectedTests.length}件選択）
            </label>
            <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto border border-gray-200 rounded-xl p-3">
              {availableTests.map((test) => (
                <label key={test} className="flex items-center gap-2 text-sm py-1 cursor-pointer hover:bg-gray-50 rounded px-1">
                  <input
                    type="checkbox"
                    checked={selectedTests.includes(test)}
                    onChange={() => toggleTest(test)}
                    className="rounded border-gray-300 text-purple-500 focus:ring-purple-500"
                  />
                  {test}
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">備考</label>
            <textarea
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30 h-16 resize-none"
              placeholder="特記事項があれば入力..."
            />
          </div>
        </div>
        <div className="p-4 border-t border-gray-100 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600">キャンセル</button>
          <button
            onClick={onClose}
            disabled={!selectedPatient || !selectedLab || selectedTests.length === 0}
            className="px-6 py-2 bg-purple-500 text-white text-sm font-medium rounded-xl hover:bg-purple-600 disabled:opacity-40 transition-colors flex items-center gap-1.5"
          >
            <Send size={14} /> オーダー送信
          </button>
        </div>
      </div>
    </div>
  );
}

function LabResultDetail({ order, onClose }: { order: LabOrder; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg animate-fade-in">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold">{order.patientName} 検査結果</h2>
            <p className="text-sm text-gray-500">{order.lab} · {new Date(order.orderedAt).toLocaleDateString("ja-JP")}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
        </div>
        <div className="p-6">
          {order.results ? (
            <div className="space-y-2">
              {order.results.map((r) => (
                <div key={r.test} className={`flex items-center justify-between p-3 rounded-xl ${
                  r.flag === "H" || r.flag === "L" ? "bg-red-50 border border-red-200" : "bg-gray-50"
                }`}>
                  <span className="text-sm font-medium">{r.test}</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-bold ${
                      r.flag === "H" || r.flag === "L" ? "text-red-600" : "text-gray-700"
                    }`}>
                      {r.value} {r.unit}
                    </span>
                    {r.flag !== "N" && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                        r.flag === "H" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
                      }`}>
                        {r.flag === "H" ? "↑高" : "↓低"}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <Clock size={32} className="mx-auto mb-2" />
              <p className="text-sm">結果待ち</p>
              {order.estimatedCompletion && (
                <p className="text-xs mt-1">予定: {new Date(order.estimatedCompletion).toLocaleDateString("ja-JP")}</p>
              )}
            </div>
          )}
        </div>
        <div className="p-4 border-t border-gray-100 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600">閉じる</button>
          {order.results && (
            <button onClick={onClose} className="px-6 py-2 bg-purple-500 text-white text-sm font-medium rounded-xl hover:bg-purple-600 flex items-center gap-1.5">
              <FileText size={14} /> カルテに取込
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PartnerNetworkPage() {
  const [tab, setTab] = useState<"orders" | "prescriptions" | "partners">("orders");
  const [showNewOrder, setShowNewOrder] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<LabOrder | null>(null);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
            <Network size={28} className="text-purple-500" /> 提携ネットワーク
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            検査機関・薬局とのAPI連携。検査オーダー・処方箋送信・結果受信を一元管理。
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card-bg border border-card-border rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold text-purple-600">{labs.length + pharmacies.filter((p) => p.status === "connected").length}</p>
          <p className="text-xs text-gray-500 mt-1">接続パートナー</p>
        </div>
        <div className="bg-card-bg border border-card-border rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{labOrders.filter((o) => o.status === "ordered").length}</p>
          <p className="text-xs text-gray-500 mt-1">検査依頼中</p>
        </div>
        <div className="bg-card-bg border border-card-border rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{labOrders.filter((o) => o.status === "completed").length}</p>
          <p className="text-xs text-gray-500 mt-1">結果受領済</p>
        </div>
        <div className="bg-card-bg border border-card-border rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold text-cyan-600">{prescriptions.filter((p) => p.status === "sent").length}</p>
          <p className="text-xs text-gray-500 mt-1">処方箋送信済</p>
        </div>
      </div>

      <div className="flex gap-1 border-b border-gray-200">
        {[
          { id: "orders" as const, label: "検査オーダー", icon: <FlaskConical size={14} /> },
          { id: "prescriptions" as const, label: "処方箋送信", icon: <Pill size={14} /> },
          { id: "partners" as const, label: "提携先一覧", icon: <ArrowRightLeft size={14} /> },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
              tab === t.id ? "border-purple-500 text-purple-600" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {tab === "orders" && (
        <div className="bg-card-bg border border-card-border rounded-2xl">
          <div className="p-4 border-b border-card-border flex items-center justify-between">
            <h3 className="font-semibold">検査オーダー一覧</h3>
            <button
              onClick={() => setShowNewOrder(true)}
              className="flex items-center gap-1.5 text-sm bg-purple-500 text-white px-4 py-2 rounded-xl font-medium hover:bg-purple-600 transition-colors"
            >
              <Plus size={14} /> 新規オーダー
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {labOrders.map((order) => {
              const st = orderStatusStyle[order.status];
              return (
                <button
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors text-left"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${st.bg}`}>
                    <span className={st.text}>{st.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold">{order.patientName}</p>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${st.bg} ${st.text}`}>
                        {st.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {order.lab} · {order.tests.slice(0, 3).join(", ")}
                      {order.tests.length > 3 && ` 他${order.tests.length - 3}件`}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-gray-400">
                      {new Date(order.orderedAt).toLocaleDateString("ja-JP")}
                    </p>
                    <ChevronRight size={16} className="text-gray-300 mt-1 ml-auto" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {tab === "prescriptions" && (
        <div className="bg-card-bg border border-card-border rounded-2xl">
          <div className="p-4 border-b border-card-border">
            <h3 className="font-semibold">処方箋送信履歴</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {prescriptions.map((rx) => (
              <div key={rx.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  rx.status === "sent" ? "bg-green-100" : rx.status === "dispensed" ? "bg-blue-100" : "bg-gray-100"
                }`}>
                  {rx.status === "sent" ? (
                    <Send size={16} className="text-green-600" />
                  ) : rx.status === "dispensed" ? (
                    <PackageCheck size={16} className="text-blue-600" />
                  ) : (
                    <FileText size={16} className="text-gray-500" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{rx.patientName}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {rx.medications.map((m) => `${m.name} ${m.dosage}`).join(", ")}
                  </p>
                  {rx.pharmacy && (
                    <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                      <Pill size={10} /> {rx.pharmacy}
                    </p>
                  )}
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  rx.status === "sent" ? "bg-green-100 text-green-700" :
                  rx.status === "dispensed" ? "bg-blue-100 text-blue-700" :
                  "bg-gray-100 text-gray-600"
                }`}>
                  {rx.status === "sent" ? "送信済" : rx.status === "dispensed" ? "調剤完了" : "下書き"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "partners" && (
        <div className="space-y-6">
          <div className="bg-card-bg border border-card-border rounded-2xl">
            <div className="p-4 border-b border-card-border">
              <h3 className="font-semibold flex items-center gap-2">
                <FlaskConical size={16} className="text-blue-500" /> 検査機関
              </h3>
            </div>
            <div className="divide-y divide-gray-50">
              {labs.map((lab) => (
                <div key={lab.id} className="flex items-center gap-4 p-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <FlaskConical size={18} className="text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{lab.name}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                      <span className="flex items-center gap-1"><MapPin size={10} />{lab.location}</span>
                      <span className="flex items-center gap-1"><Phone size={10} />{lab.phone}</span>
                      <span className="flex items-center gap-1"><Clock size={10} />平均{lab.turnaround}</span>
                    </div>
                  </div>
                  <span className="flex items-center gap-1.5 text-xs font-medium text-green-600">
                    <CheckCircle2 size={14} /> 接続済
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-card-bg border border-card-border rounded-2xl">
            <div className="p-4 border-b border-card-border">
              <h3 className="font-semibold flex items-center gap-2">
                <Pill size={16} className="text-green-500" /> 薬局
              </h3>
            </div>
            <div className="divide-y divide-gray-50">
              {pharmacies.map((ph) => (
                <div key={ph.id} className="flex items-center gap-4 p-4">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                    <Pill size={18} className="text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{ph.name}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                      <span className="flex items-center gap-1"><MapPin size={10} />{ph.location}</span>
                      <span className="flex items-center gap-1"><Phone size={10} />{ph.phone}</span>
                    </div>
                  </div>
                  {ph.status === "connected" ? (
                    <span className="flex items-center gap-1.5 text-xs font-medium text-green-600">
                      <CheckCircle2 size={14} /> 接続済
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-xs font-medium text-amber-500">
                      <AlertCircle size={14} /> 申請中
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showNewOrder && <NewLabOrderModal onClose={() => setShowNewOrder(false)} />}
      {selectedOrder && <LabResultDetail order={selectedOrder} onClose={() => setSelectedOrder(null)} />}
    </div>
  );
}
