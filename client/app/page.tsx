import Link from 'next/link';

export default function Home() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#000', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', fontFamily: 'inherit' }}>
      
      {/* Navbar */}
      <nav style={{ width: '100%', maxWidth: '1000px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4.5 3h15" />
            <path d="M6 3v16a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V3" />
            <path d="M6 14h12" />
          </svg>
          <span style={{ fontWeight: 600, fontSize: '18px', letterSpacing: '-0.02em' }}>AutoAudit</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', fontSize: '14px' }}>
          <Link href="#" style={{ color: '#888', textDecoration: 'none', transition: 'color 0.2s' }} className="hover:text-white">Docs</Link>
          <Link href="/login" style={{ color: '#888', textDecoration: 'none', transition: 'color 0.2s' }} className="hover:text-white">Sign In</Link>
          <Link href="/signup" style={{ 
            backgroundColor: '#fff', color: '#000', textDecoration: 'none', 
            padding: '8px 16px', borderRadius: '6px', fontWeight: 500, transition: 'background-color 0.2s'
          }} className="hover:bg-gray-200">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main style={{ 
        flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', 
        justifyContent: 'center', textAlign: 'center', padding: '60px 24px', 
        width: '100%', maxWidth: '800px', zIndex: 10, position: 'relative'
      }}>
        
        <h1 style={{ 
          fontSize: 'clamp(48px, 8vw, 84px)', fontWeight: 700, 
          letterSpacing: '-0.04em', lineHeight: 1.05, marginBottom: '24px' 
        }}>
          White-Glove AI for
          <br />
          <span style={{ color: '#555' }}>Compliance Audits</span>
        </h1>
        
        <p style={{ 
          color: '#888', fontSize: 'clamp(16px, 2vw, 20px)', lineHeight: 1.6, 
          maxWidth: '600px', marginBottom: '40px' 
        }}>
          Upload your company&apos;s reference documents and industry questionnaires. Our AI agents automate the audit matching process with verified citations and zero hallucination.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '80px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link href="/signup" style={{ 
            backgroundColor: '#fff', color: '#000', textDecoration: 'none', 
            padding: '12px 24px', borderRadius: '8px', fontWeight: 500,
            display: 'inline-flex', alignItems: 'center', gap: '8px'
          }} className="hover:bg-gray-200 transition-colors">
            Start Auditing <span style={{ fontSize: '18px' }}>→</span>
          </Link>
          <Link href="/login" style={{ 
            backgroundColor: 'transparent', border: '1px solid #333', color: '#fff', 
            textDecoration: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: 500
          }} className="hover:border-gray-500 transition-colors">
            See How It Works
          </Link>
        </div>

        {/* Terminal Block */}
        <div style={{ 
          backgroundColor: '#0a0a0a', border: '1px solid #222', 
          borderRadius: '12px', width: '100%', maxWidth: '720px', 
          textAlign: 'left', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
        }}>
          <div style={{ 
            padding: '12px 16px', borderBottom: '1px solid #222', 
            display: 'flex', alignItems: 'center', gap: '6px' 
          }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#333' }}></div>
            <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#333' }}></div>
            <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#333' }}></div>
            <span style={{ marginLeft: '12px', fontSize: '12px', color: '#555', fontFamily: 'monospace', letterSpacing: '0.1em' }}>terminal</span>
          </div>
          <div style={{ padding: '24px', fontFamily: 'monospace', fontSize: '14px', lineHeight: 1.6 }}>
            <div style={{ color: '#666', marginBottom: 12 }}>POST /api/v1/generate</div>
            <div style={{ color: '#aaa' }}>{"{"}</div>
            <div style={{ paddingLeft: 16 }}>
              <span style={{ color: '#eee' }}>&quot;project&quot;:</span> <span style={{ color: '#888' }}>&quot;SOC2 Readiness Matrix&quot;,</span>
            </div>
            <div style={{ paddingLeft: 16 }}>
              <span style={{ color: '#eee' }}>&quot;question&quot;:</span> <span style={{ color: '#888' }}>&quot;How is employee termination access revoked?&quot;</span>
            </div>
            <div style={{ color: '#aaa' }}>{"}"}</div>
            <div style={{ marginTop: 20, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <span style={{ color: '#555' }}>→</span>
              <span style={{ color: '#00ffaa' }}>
                &quot;Access is revoked within 24 hours of termination (Employee Handbook, Pg 12)&quot; [Source 1]
              </span>
            </div>
            <div style={{ paddingLeft: 20, marginTop: 4, color: '#333', fontSize: '12px' }}>
              confidence: 98%
            </div>
          </div>
        </div>
      </main>

      {/* Background Glow */}
      <div style={{ 
        position: 'fixed', top: '20%', left: '50%', transform: 'translate(-50%, -50%)',
        width: '80vw', height: '60vh', background: 'radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 60%)',
        zIndex: 0, pointerEvents: 'none'
      }}></div>
    </div>
  );
}
