import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-terms-and-conditions',
  standalone: true,
  template: `
    <style>
      :host {
        display: block;
        --bg: #0f172a;
        --bg-soft: #111827;
        --card: rgba(255, 255, 255, 0.08);
        --card-border: rgba(255, 255, 255, 0.12);
        --text: #e5e7eb;
        --muted: #94a3b8;
        --primary: #8b5cf6;
        --primary-2: #ec4899;
        --white: #ffffff;
        --shadow: 0 20px 50px rgba(0, 0, 0, 0.35);
        --radius: 22px;
      }

      * {
        box-sizing: border-box;
      }

      .terms-page {
        min-height: 100vh;
        background:
          radial-gradient(circle at top left, rgba(139, 92, 246, 0.18), transparent 30%),
          radial-gradient(circle at top right, rgba(236, 72, 153, 0.14), transparent 30%),
          linear-gradient(180deg, #0b1120 0%, #0f172a 45%, #111827 100%);
        color: var(--text);
        padding: 32px 16px 64px;
      }

      .container {
        width: min(100%, 1100px);
        margin: 0 auto;
      }

      .hero-card {
        background: linear-gradient(135deg, rgba(139, 92, 246, 0.22), rgba(236, 72, 153, 0.16));
        border: 1px solid var(--card-border);
        border-radius: 32px;
        box-shadow: var(--shadow);
        padding: 32px 24px;
        margin-bottom: 24px;
      }

      .badge {
        display: inline-flex;
        padding: 0.45rem 0.9rem;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid rgba(255, 255, 255, 0.1);
        color: #ddd6fe;
        font-size: 0.85rem;
        font-weight: 700;
        margin-bottom: 16px;
      }

      h1 {
        margin: 0 0 12px;
        font-size: clamp(2rem, 4vw, 3.5rem);
        line-height: 1.05;
        color: var(--white);
      }

      .hero-card p {
        margin: 0;
        color: #dbe4f0;
        max-width: 800px;
        font-size: 1rem;
        line-height: 1.7;
      }

      .updated {
        margin-top: 16px !important;
        color: #cbd5e1 !important;
        font-size: 0.92rem !important;
      }

      .content-grid {
        display: grid;
        grid-template-columns: 280px 1fr;
        gap: 24px;
      }

      .toc,
      .content-card {
        background: var(--card);
        border: 1px solid var(--card-border);
        border-radius: 24px;
        box-shadow: var(--shadow);
      }

      .toc {
        padding: 20px;
        position: sticky;
        top: 24px;
        height: fit-content;
      }

      .toc h2 {
        margin: 0 0 14px;
        font-size: 1rem;
        color: var(--white);
      }

      .toc a {
        display: block;
        color: var(--muted);
        text-decoration: none;
        padding: 8px 0;
        font-size: 0.95rem;
      }

      .toc a:hover {
        color: var(--white);
      }

      .content-card {
        padding: 28px 22px;
      }

      section + section {
        margin-top: 28px;
        padding-top: 28px;
        border-top: 1px solid rgba(255, 255, 255, 0.08);
      }

      h3 {
        margin: 0 0 12px;
        color: var(--white);
        font-size: 1.2rem;
      }

      p, li {
        color: var(--text);
        line-height: 1.8;
        font-size: 0.98rem;
      }

      ul {
        margin: 12px 0 0;
        padding-left: 20px;
      }

      .note {
        margin-top: 18px;
        padding: 14px 16px;
        border-radius: 18px;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.08);
        color: #dbe4f0;
      }

      .actions {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        margin-top: 32px;
      }

      .btn {
        border: none;
        border-radius: 999px;
        padding: 0.95rem 1.35rem;
        cursor: pointer;
        font-weight: 700;
        transition: 0.25s ease;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.55rem;
        text-align: center;
        text-decoration: none;
      }

      .btn-primary {
        background: linear-gradient(135deg, var(--primary), var(--primary-2));
        color: var(--white);
        box-shadow: 0 12px 30px rgba(139, 92, 246, 0.28);
      }

      .btn-outline {
        background: transparent;
        color: var(--white);
        border: 1px solid rgba(255, 255, 255, 0.18);
      }

      .btn:hover {
        transform: translateY(-1px);
      }

      @media (max-width: 900px) {
        .content-grid {
          grid-template-columns: 1fr;
        }

        .toc {
          position: static;
        }
      }
    </style>

    <div class="terms-page">
      <div class="container">
        <div class="hero-card">
          <div class="badge">Enjoy · Legal</div>
          <h1>Términos y Condiciones</h1>
          <p>
            Estos Términos y Condiciones regulan el acceso, navegación y uso de la plataforma
            Enjoy, incluyendo su sitio web, aplicación móvil, promociones, cupones, beneficios,
            formularios de contacto y servicios relacionados para clientes y negocios aliados.
          </p>
          <p class="updated">Última actualización: 24 de marzo de 2026</p>
        </div>

        <div class="content-grid">
          <aside class="toc">
            <h2>Contenido</h2>
               <a href="/privacy-policy#aceptacion">1. Aceptación</a>
            <a href="/privacy-policy#objeto">2. Objeto del servicio</a>
            <a href="/privacy-policy#registro">3. Registro y cuentas</a>
            <a href="/privacy-policy#clientes">4. Uso para clientes</a>
            <a href="/privacy-policy#negocios">5. Uso para negocios aliados</a>
            <a href="/privacy-policy#cupones">6. Cupones y promociones</a>
            <a href="/privacy-policy#propiedad">7. Propiedad intelectual</a>
            <a href="/privacy-policy#prohibiciones">8. Conductas prohibidas</a>
            <a href="/privacy-policy#responsabilidad">9. Limitación de responsabilidad</a>
            <a href="/privacy-policy#privacidad">10. Privacidad y datos</a>
            <a href="/privacy-policy#cambios">11. Modificaciones</a>
            <a href="/privacy-policy#terminacion">12. Suspensión o terminación</a>
            <a href="/privacy-policy#ley">13. Ley aplicable</a>
            <a href="/privacy-policy#contacto">14. Contacto</a>
          </aside>

          <div class="content-card">
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
              <div class="note">
                Recomendado: enlazar esta sección a tu ruta pública
                <strong>/privacy-policy</strong>.
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

              <div class="actions">
                <a class="btn btn-primary" href="https://ecuenjoy.com/" target="_blank" rel="noopener noreferrer">
                  Ir a Enjoy
                </a>
                <a class="btn btn-outline" href="/privacy-policy">
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
