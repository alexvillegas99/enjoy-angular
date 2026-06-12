import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-terms-and-conditions',
  standalone: true,
  template: `
    <div class="min-h-screen bg-surface-muted font-roboto px-4 py-10 sm:py-12">
      <div class="mx-auto w-full max-w-[1100px]">
        <!-- Hero -->
        <div class="surface-brand rounded-2xl p-8 sm:p-10 mb-8 animate-in">
          <span class="badge badge-warning mb-4">
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/></svg>
            Enjoy · Legal
          </span>
          <h1 class="page-title text-white! mb-3">Términos y Condiciones</h1>
          <p class="max-w-3xl text-base leading-relaxed text-white/85">
            Estos Términos y Condiciones regulan el acceso, navegación y uso de la plataforma
            Enjoy, incluyendo su sitio web, aplicación móvil, promociones, cupones, beneficios,
            formularios de contacto y servicios relacionados para clientes y negocios aliados.
          </p>
          <p class="mt-5 inline-flex items-center gap-2 text-sm text-white/70">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 7.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3.5"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h5"/><circle cx="16" cy="16" r="6"/><path d="M16 14v2l1 1"/></svg>
            Última actualización: 24 de marzo de 2026
          </p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
          <!-- Table of contents -->
          <aside class="card p-5 lg:sticky lg:top-6 h-fit">
            <h2 class="section-title flex items-center gap-2 mb-3">
              <span class="icon-badge icon-badge-primary w-8 h-8">
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12h.01"/><path d="M3 18h.01"/><path d="M3 6h.01"/><path d="M8 12h13"/><path d="M8 18h13"/><path d="M8 6h13"/></svg>
              </span>
              Contenido
            </h2>
            <nav class="flex flex-col">
              <a href="/privacy-policy#aceptacion" class="block rounded-md px-3 py-2 text-sm text-text-body hover:bg-accent-soft hover:text-accent transition-colors">1. Aceptación</a>
              <a href="/privacy-policy#objeto" class="block rounded-md px-3 py-2 text-sm text-text-body hover:bg-accent-soft hover:text-accent transition-colors">2. Objeto del servicio</a>
              <a href="/privacy-policy#registro" class="block rounded-md px-3 py-2 text-sm text-text-body hover:bg-accent-soft hover:text-accent transition-colors">3. Registro y cuentas</a>
              <a href="/privacy-policy#clientes" class="block rounded-md px-3 py-2 text-sm text-text-body hover:bg-accent-soft hover:text-accent transition-colors">4. Uso para clientes</a>
              <a href="/privacy-policy#negocios" class="block rounded-md px-3 py-2 text-sm text-text-body hover:bg-accent-soft hover:text-accent transition-colors">5. Uso para negocios aliados</a>
              <a href="/privacy-policy#cupones" class="block rounded-md px-3 py-2 text-sm text-text-body hover:bg-accent-soft hover:text-accent transition-colors">6. Cupones y promociones</a>
              <a href="/privacy-policy#propiedad" class="block rounded-md px-3 py-2 text-sm text-text-body hover:bg-accent-soft hover:text-accent transition-colors">7. Propiedad intelectual</a>
              <a href="/privacy-policy#prohibiciones" class="block rounded-md px-3 py-2 text-sm text-text-body hover:bg-accent-soft hover:text-accent transition-colors">8. Conductas prohibidas</a>
              <a href="/privacy-policy#responsabilidad" class="block rounded-md px-3 py-2 text-sm text-text-body hover:bg-accent-soft hover:text-accent transition-colors">9. Limitación de responsabilidad</a>
              <a href="/privacy-policy#privacidad" class="block rounded-md px-3 py-2 text-sm text-text-body hover:bg-accent-soft hover:text-accent transition-colors">10. Privacidad y datos</a>
              <a href="/privacy-policy#cambios" class="block rounded-md px-3 py-2 text-sm text-text-body hover:bg-accent-soft hover:text-accent transition-colors">11. Modificaciones</a>
              <a href="/privacy-policy#terminacion" class="block rounded-md px-3 py-2 text-sm text-text-body hover:bg-accent-soft hover:text-accent transition-colors">12. Suspensión o terminación</a>
              <a href="/privacy-policy#ley" class="block rounded-md px-3 py-2 text-sm text-text-body hover:bg-accent-soft hover:text-accent transition-colors">13. Ley aplicable</a>
              <a href="/privacy-policy#contacto" class="block rounded-md px-3 py-2 text-sm text-text-body hover:bg-accent-soft hover:text-accent transition-colors">14. Contacto</a>
            </nav>
          </aside>

          <!-- Content -->
          <div class="card p-7 sm:p-8 [&_section+section]:mt-7 [&_section+section]:pt-7 [&_section+section]:border-t [&_section+section]:border-border-soft [&_h3]:section-title [&_h3]:text-lg [&_h3]:mb-3 [&_p]:text-text-body [&_p]:leading-relaxed [&_p]:text-[0.98rem] [&_li]:text-text-body [&_li]:leading-relaxed [&_ul]:mt-3 [&_ul]:pl-5 [&_ul]:list-disc [&_ul]:space-y-1.5 [&_p+p]:mt-3">
            <section id="aceptacion">
              <h3>1. Aceptación de los términos</h3>
              <p>
                Al acceder, navegar, registrarte o utilizar Enjoy, aceptas quedar obligado por
                estos Términos y Condiciones. Si no estás de acuerdo con alguno de ellos,
                debes abstenerte de usar la plataforma y sus servicios.
              </p>
            </section>

            <section id="objeto">
              <h3>2. Objeto del servicio</h3>
              <p>
                Enjoy ofrece una plataforma digital orientada a conectar clientes con promociones,
                beneficios y experiencias comerciales, así como a brindar visibilidad y herramientas
                de acceso a negocios aliados dentro del ecosistema Enjoy.
              </p>
              <p>
                La plataforma puede incluir sitio web, aplicación móvil, formularios de afiliación,
                acceso a portal de negocios, contenidos informativos, cupones promocionales y otros
                servicios relacionados.
              </p>
            </section>

            <section id="registro">
              <h3>3. Registro y cuentas de usuario</h3>
              <p>
                Algunas funcionalidades pueden requerir registro previo. El usuario se compromete a
                proporcionar información veraz, completa y actualizada.
              </p>
              <p>
                Cada usuario es responsable de la confidencialidad de sus credenciales de acceso y de
                toda actividad realizada desde su cuenta. Enjoy podrá solicitar validaciones adicionales
                cuando lo considere necesario por motivos de seguridad o control operativo.
              </p>
            </section>

            <section id="clientes">
              <h3>4. Uso para clientes</h3>
              <p>
                Los clientes pueden utilizar Enjoy para descubrir promociones, revisar información de
                locales aliados, acceder a beneficios y participar en dinámicas promocionales disponibles
                en la plataforma.
              </p>
              <ul>
                <li>Los beneficios estarán sujetos a disponibilidad, vigencia y condiciones específicas.</li>
                <li>El uso de cupones puede requerir validación dentro de la app o ante el negocio aliado.</li>
                <li>Enjoy no garantiza que todos los beneficios estén disponibles en todo momento o en todas las ciudades.</li>
              </ul>
            </section>

            <section id="negocios">
              <h3>5. Uso para negocios aliados</h3>
              <p>
                Los negocios aliados o interesados en afiliarse pueden interactuar con Enjoy a través
                del portal, formularios de contacto o canales oficiales habilitados.
              </p>
              <ul>
                <li>El negocio debe proporcionar información real y verificable.</li>
                <li>Enjoy podrá aceptar, rechazar o pausar solicitudes de afiliación según sus criterios comerciales y operativos.</li>
                <li>El acceso al portal podrá estar sujeto a validación previa, permisos y estado de la cuenta.</li>
              </ul>
            </section>

            <section id="cupones">
              <h3>6. Cupones, promociones y beneficios</h3>
              <p>
                Las promociones publicadas en Enjoy son informativas y están sujetas a términos
                particulares definidos por cada campaña o negocio aliado.
              </p>
              <ul>
                <li>Los beneficios pueden tener fechas de inicio y fin, stock limitado o restricciones específicas.</li>
                <li>Los cupones no son transferibles salvo que se indique expresamente lo contrario.</li>
                <li>El uso indebido, duplicado o fraudulento de promociones podrá ocasionar bloqueo inmediato.</li>
                <li>Enjoy podrá modificar o retirar promociones sin previo aviso cuando existan razones operativas, comerciales o legales.</li>
              </ul>
            </section>

            <section id="propiedad">
              <h3>7. Propiedad intelectual</h3>
              <p>
                Todos los elementos de la plataforma, incluyendo marcas, logotipos, diseños, textos,
                imágenes, interfaces, código, estructura visual y contenidos, son propiedad de Enjoy o
                de sus respectivos titulares y están protegidos por la normativa aplicable.
              </p>
              <p>
                Queda prohibida su reproducción, distribución, modificación, publicación o explotación
                sin autorización previa y por escrito.
              </p>
            </section>

            <section id="prohibiciones">
              <h3>8. Conductas prohibidas</h3>
              <p>El usuario se obliga a no:</p>
              <ul>
                <li>Usar la plataforma para fines ilícitos, fraudulentos o no autorizados.</li>
                <li>Intentar vulnerar la seguridad, integridad o disponibilidad del sistema.</li>
                <li>Suplantar identidades o proporcionar información falsa.</li>
                <li>Reutilizar promociones de forma abusiva o contraria a las reglas de uso.</li>
                <li>Copiar, automatizar o extraer contenido sin autorización.</li>
              </ul>
            </section>

            <section id="responsabilidad">
              <h3>9. Limitación de responsabilidad</h3>
              <p>
                Enjoy actúa como plataforma tecnológica e informativa. Salvo que se indique expresamente,
                no es parte directa de la relación comercial final entre cliente y negocio aliado.
              </p>
              <p>
                Enjoy no garantiza disponibilidad continua e ininterrumpida del servicio ni será responsable
                por interrupciones, errores externos, caídas de terceros, fuerza mayor o decisiones comerciales
                adoptadas por establecimientos aliados.
              </p>
            </section>

            <section id="privacidad">
              <h3>10. Privacidad y tratamiento de datos</h3>
              <p>
                El tratamiento de datos personales se rige por la Política de Privacidad de Enjoy. Al usar
                la plataforma, aceptas el tratamiento de los datos estrictamente necesarios para el funcionamiento,
                seguridad, soporte, analítica, contacto comercial y mejora del servicio.
              </p>
              <div class="mt-4 flex items-start gap-3 rounded-xl border border-info-soft bg-info-soft/40 p-4 text-sm text-text-body">
                <svg class="w-5 h-5 text-info shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                <span>
                  Recomendado: enlazar esta sección a tu ruta pública
                  <strong class="text-text-dark">/privacy-policy</strong>.
                </span>
              </div>
            </section>

            <section id="cambios">
              <h3>11. Modificaciones a los términos</h3>
              <p>
                Enjoy podrá actualizar, modificar o reemplazar estos Términos y Condiciones en cualquier
                momento. La versión vigente será la publicada en esta página. El uso continuo de la plataforma
                después de dichos cambios constituirá aceptación de la versión actualizada.
              </p>
            </section>

            <section id="terminacion">
              <h3>12. Suspensión o terminación</h3>
              <p>
                Enjoy podrá suspender o cancelar accesos, cuentas o funcionalidades cuando detecte incumplimientos,
                uso abusivo, actividades sospechosas, riesgos de seguridad o cualquier conducta contraria a estos términos.
              </p>
            </section>

            <section id="ley">
              <h3>13. Ley aplicable y jurisdicción</h3>
              <p>
                Estos Términos y Condiciones se interpretarán de conformidad con la legislación aplicable en Ecuador.
                Cualquier controversia será resuelta por la autoridad competente conforme a derecho.
              </p>
            </section>

            <section id="contacto">
              <h3>14. Contacto</h3>
              <p>
                Para consultas relacionadas con estos Términos y Condiciones puedes contactarte con Enjoy
                a través de sus canales oficiales, sitio web o correo de soporte.
              </p>

              <div class="flex flex-wrap gap-3 mt-8">
                <a class="btn-primary" href="https://ecuenjoy.com/" target="_blank" rel="noopener noreferrer">
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>
                  Ir a Enjoy
                </a>
                <a class="btn-outline" href="/privacy-policy">
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg>
                  Ver Política de Privacidad
                </a>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrivacyPolicy {}
