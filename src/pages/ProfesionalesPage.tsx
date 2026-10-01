import React, { useState } from 'react';
import { SEOMetaHead } from '../components/SEOMetaHead';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { SPANISH_PROVINCES } from '../data/pricing/pciPricingData';
import { CheckCircle2 } from 'lucide-react';

interface ProfesionalesPageProps {
  navigate: (path: string) => void;
}

export const ProfesionalesPage: React.FC<ProfesionalesPageProps> = ({ navigate }) => {
  const [formData, setFormData] = useState({
    company_name: '',
    legal_name: '',
    email: '',
    phone: '',
    website: '',
    province: 'Madrid',
    services: {
      active_fire: false,
      passive_fire: true,
      maintenance: false,
      engineering: false,
      industrial: true
    },
    minimum_project_value: 2500,
    notes: ''
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await fetch('/api/admin/providers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          regions: [formData.province],
          shared_leads: true,
          exclusive_leads: false,
          verified: false,
          status: 'PENDING_VERIFICATION'
        })
      });
      setSubmitted(true);
    } catch {
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  const breadcrumbs = [
    { name: 'Red de Profesionales PCI', url: '/profesionales/' }
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <SEOMetaHead
        title="Para Empresas Instaladoras PCI: Leads Cualificados | CuántoVale"
        description="Únete a la red de aplicadores e ingenierías PCI de CuántoVale. Recibe oportunidades con variables técnicas calculadas y compartidas con un máximo de 2 empresas."
        path="/profesionales/"
        breadcrumbs={breadcrumbs}
      />

      <Breadcrumbs items={breadcrumbs} navigate={navigate} />

      <section className="pt-8 pb-12 px-4 sm:px-6 border-b border-slate-200">
        <div className="mx-auto max-w-4xl space-y-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Red de Colaboradores
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-950">
            Recibe oportunidades PCI mejor cualificadas
          </h1>
          <p className="text-base text-slate-600 leading-relaxed max-w-2xl">
            Sin subastas masivas. Solicitudes con metros cuadrados, tipo de estructura y resistencia R ya filtrados antes del contacto comercial.
          </p>
        </div>
      </section>

      {/* VALUE PROPOSITION: Clean columns with dividers */}
      <section className="py-14 px-4 sm:px-6 border-b border-slate-200">
        <div className="mx-auto max-w-4xl">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-xs text-slate-700">
            <div className="space-y-1.5 border-t border-slate-200 pt-4">
              <span className="font-semibold text-sm text-slate-950 block">Máximo 2 empresas por lead</span>
              <p className="text-slate-600 leading-relaxed">
                Nunca distribuimos una solicitud a más de dos instaladores en la provincia. Alta probabilidad de cierre.
              </p>
            </div>

            <div className="space-y-1.5 border-t border-slate-200 pt-4">
              <span className="font-semibold text-sm text-slate-950 block">Cualificación técnica</span>
              <p className="text-slate-600 leading-relaxed">
                Conocerás las dimensiones de nave, el sistema preferido y si existe requerimiento de bomberos previo.
              </p>
            </div>

            <div className="space-y-1.5 border-t border-slate-200 pt-4">
              <span className="font-semibold text-sm text-slate-950 block">Sin comisiones sobre obra</span>
              <p className="text-slate-600 leading-relaxed">
                Tú fijas tus precios con tu cliente. CuántoVale no comisiona sobre el importe final contratado.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FORM: Sober and clean */}
      <section className="py-16 px-4 sm:px-6 bg-slate-50/50">
        <div className="mx-auto max-w-xl">
          {submitted ? (
            <div className="border border-slate-200 bg-white p-8 rounded-lg text-center space-y-3">
              <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto" />
              <h3 className="text-base font-bold text-slate-950">
                Solicitud registrada
              </h3>
              <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                Hemos registrado los datos de tu empresa. Verificaremos la acreditación industrial antes de habilitar el enrutamiento de oportunidades en tu zona.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="border border-slate-200 bg-white p-6 sm:p-8 rounded-lg space-y-4 text-xs">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-950">Registro de empresa instaladora / aplicadora</h3>
                <p className="text-slate-500 text-[11px]">Introduce tus datos para el enrutamiento asistido.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1 text-[11px] uppercase tracking-wide">Nombre Comercial *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Ignifugaciones Norte"
                    value={formData.company_name}
                    onChange={e => setFormData({ ...formData, company_name: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1 text-[11px] uppercase tracking-wide">Razón Social *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Ignifugaciones Norte S.L."
                    value={formData.legal_name}
                    onChange={e => setFormData({ ...formData, legal_name: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1 text-[11px] uppercase tracking-wide">Email Profesional *</label>
                  <input
                    type="email"
                    required
                    placeholder="licitaciones@empresa.es"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1 text-[11px] uppercase tracking-wide">Teléfono *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+34 912 345 678"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1 text-[11px] uppercase tracking-wide">Provincia Principal de Actuación *</label>
                <select
                  value={formData.province}
                  onChange={e => setFormData({ ...formData, province: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 focus:outline-none transition-all cursor-pointer"
                >
                  {SPANISH_PROVINCES.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1 text-[11px] uppercase tracking-wide">Especialidades Habilitadas</label>
                <div className="grid grid-cols-2 gap-2 text-slate-700 text-[11px] pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      checked={formData.services.passive_fire}
                      onChange={e => setFormData({
                        ...formData,
                        services: { ...formData.services, passive_fire: e.target.checked }
                      })}
                    />
                    <span>Protección Pasiva (Mortero/Pintura)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      checked={formData.services.active_fire}
                      onChange={e => setFormData({
                        ...formData,
                        services: { ...formData.services, active_fire: e.target.checked }
                      })}
                    />
                    <span>Protección Activa (BIEs/Rociadores)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      checked={formData.services.maintenance}
                      onChange={e => setFormData({
                        ...formData,
                        services: { ...formData.services, maintenance: e.target.checked }
                      })}
                    />
                    <span>Mantenimiento RIPCI</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      checked={formData.services.engineering}
                      onChange={e => setFormData({
                        ...formData,
                        services: { ...formData.services, engineering: e.target.checked }
                      })}
                    />
                    <span>Ingeniería / Proyectos</span>
                  </label>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="glass-button-primary w-full rounded-xl py-3 px-4 text-xs font-semibold text-white shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {loading ? 'Enviando...' : 'Registrar empresa colaboradora'}
                </button>
              </div>
            </form>
          )}
        </div>
      </section>
    </div>
  );
};
