/* eslint-disable no-restricted-properties */
'use client';

import axios from 'axios';
import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import secureLocalStorage from 'react-secure-storage';

// eslint-disable-next-line @typescript-eslint/naming-convention
import CguVyftContentFr from './CGU_Vyft_content_fr'; // Assure-toi que ce fichier existe et est exporté
import styles from './page.module.css';
type Message = { from: 'ai' | 'user'; text: string };

// IA via OpenAI API (GPT-4o) via API interne sécurisée
async function callmodelAPI(messages: Array<Message>): Promise<string> {
  const res = await fetch('https://www.vylte-finuka.com/api/ask-ai', {
    method: 'POST',
    // eslint-disable-next-line no-restricted-properties
    headers: { 'Content-Type': 'application/json', 'x-vyftprogram-api-key': process.env.NEXT_PUBLIC_VYFTPROGRAM_API_KEY || 'vyftprogramwQvNtGG69p5olaIFWe4n6CBCnCVGu1m1jZvOaFi95laYqUx2xyBq68IEF2eKQXFS9ZoCTZFzYW6vmuGKe2bJLdmRpBr5Hqk456K5Z3noysX6ZlzYuclOqDWp4ZioCiYl5JyBDvA3p1pwCtbTadv9reB65haBGMeNCygcj36pYUPArQDOgP5tniS5h5604dQ4dB4ylxX2LpaDlYZMSdjpU7Zg9xekWm3pablpJ9FehT8vJfVBiuWyjlRcMSBAJHLLOJl31aVsTJjWix7UXRq7xAtDeWAnAM2ALnSWVEvlr5b2wfjawVYOJtXpNi8CO04qbskHmRw8cQc58L42X0WwqQQRgVLu3qT6lQwVuqZJgCNaZNyGc8HQa0thVu7FNOhO2sfeN7vujSK1wwpSkYBXpELSrCnkuo0dmHRz23DrgY1s5JWC7rthQBiRXCdbmHbIUoYafcgjUMLDJXvzLcMMSjWFs85kWDe0pmPn77YC3gjELkvDxVrRO' },
    body: JSON.stringify({ messages }),
  });
  const data = await res.json();
  return data.reply || '';
}

async function getComptaData(enseigne: string, squareCustomerId: string) {
  const res = await fetch(
    `https://vyft-program.vylte-finuka.com/api/vyfthealth_proc?enseigne=${ encodeURIComponent(
      enseigne,
    ) }&squareCustomerId=${ encodeURIComponent(squareCustomerId) }`,
    {
      headers: {
        // eslint-disable-next-line no-restricted-properties
        'x-vyftprogram-api-key': process.env.NEXT_PUBLIC_VYFTPROGRAM_API_KEY || 'NEXT_PUBLIC_VYFTPROGRAM_API_KEY=vyftprogramwQvNtGG69p5olaIFWe4n6CBCnCVGu1m1jZvOaFi95laYqUx2xyBq68IEF2eKQXFS9ZoCTZFzYW6vmuGKe2bJLdmRpBr5Hqk456K5Z3noysX6ZlzYuclOqDWp4ZioCiYl5JyBDvA3p1pwCtbTadv9reB65haBGMeNCygcj36pYUPArQDOgP5tniS5h5604dQ4dB4ylxX2LpaDlYZMSdjpU7Zg9xekWm3pablpJ9FehT8vJfVBiuWyjlRcMSBAJHLLOJl31aVsTJjWix7UXRq7xAtDeWAnAM2ALnSWVEvlr5b2wfjawVYOJtXpNi8CO04qbskHmRw8cQc58L42X0WwqQQRgVLu3qT6lQwVuqZJgCNaZNyGc8HQa0thVu7FNOhO2sfeN7vujSK1wwpSkYBXpELSrCnkuo0dmHRz23DrgY1s5JWC7rthQBiRXCdbmHbIUoYafcgjUMLDJXvzLcMMSjWFs85kWDe0pmPn77YC3gjELkvDxVrRO',
      },
    },
  );
  const data = await res.json();
  if (data.success) {
    // Accès à toutes les métriques
    return data.data; // contient dailySteps, dailyRevenue, monthlyInvestment, upcomingInvoiceAmount, etc.
  } else {
    throw new Error(data.message || 'Erreur API');
  }
}

export default function SquareAIFloat() {
  const [ open, setOpen ] = useState(false);
  type Message = { from: 'ai' | 'user'; text: string };
  const [ messages, setMessages ] = useState<Array<Message>>([
    {
      from: 'ai',
      text: 'Bonjour, je suis Vyft Nérethense, votre agent IA ✨. Comment pourrais-je vous aider avec Vyft ? Posez-moi votre question ou réponse !',
    },
  ]);
  const [ input, setInput ] = useState('');
  const [ loading, setLoading ] = useState(false);

  // Ajout pour stocker les infos utilisateur
  const [ userInfo, setUserInfo ] = useState<any>(null);
  const [ denomination, setDenomination ] = useState<string | null>(null);
  const [ squareCustomerId, setsquareCustomerId ] = useState<string | null>(null);
  const [ comptaData, setComptaData ] = useState<any>(null);
  const [ cgvu, setCgvu ] = useState<string>('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Récupération des infos utilisateur depuis Auth0 (comme dans reports.tsx)
  useEffect(() => {
    const fetchUserInfo = async() => {
      try {
        const userToken = secureLocalStorage.getItem('userToken') as string | null;
        if (!userToken) return;

        // Récupérer les infos utilisateur depuis Auth0
        const userInfoResponse = await axios.get(
          `${ process.env.NEXT_PUBLIC_AUTH0_DOMAIN }/userinfo`,
          {
            headers: {
              Authorization: `Bearer ${ userToken }`,
              'Content-Type': 'application/json',
            },
          },
        );
        const userId = userInfoResponse.data.sub;

        // Récupérer les métadonnées utilisateur (enseigne et squareCustomerId)
        const response = await axios.get(
          `${ process.env.NEXT_PUBLIC_AUTH0_DOMAIN }/api/v2/users/${ userId }`,
          {
            headers: {
              Authorization: `Bearer ${ userToken }`,
              'Content-Type': 'application/json',
            },
          },
        );
        setDenomination(response.data?.user_metadata?.denomination?.trim() || null);
        setsquareCustomerId(response.data?.user_metadata?.subid?.trim() || null);

        // Fusionne app_metadata dans userInfo
        setUserInfo({
          ...userInfoResponse.data,
          app_metadata: response.data?.app_metadata || {},
        });
      } catch (error) {
        setDenomination(null);
        setsquareCustomerId(null);
        setUserInfo(null);
      }
    };
    fetchUserInfo();
  }, []);

  // Scroll automatique vers le bas uniquement lors de la génération (loading)
  useEffect(() => {
    if (loading && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'auto', block: 'end' });
    }
  }, [ loading ]);

  useEffect(() => {
    // Dès que l'utilisateur est identifié, on charge les données de marcheurs
    if (denomination && squareCustomerId) {
      getComptaData(denomination, squareCustomerId)
        .then(setComptaData)
        .catch(() => setComptaData(null));
    }
  }, [ denomination, squareCustomerId ]);

  // Précharge le contenu CGVU depuis la page CGVU (via le script JSON du DOM)
  useEffect(() => {
    // On tente de trouver le script JSON sur la page CGVU (si déjà chargé)
    function tryLoadCGVUFromDOM() {
      const script = document.getElementById('vyft-cgvu-json');
      if (script) {
        try {
          const data = JSON.parse(script.textContent || '{}');
          if (data.cgvu) setCgvu(data.cgvu);
        } catch (e) {
          // ignore
        }
      }
    }

    // Si déjà sur la page CGVU, on charge tout de suite
    tryLoadCGVUFromDOM();

    // Sinon, on précharge la page CGVU en arrière-plan et on extrait le JSON
    if (!cgvu) {
      fetch('https://vyft-program.vylte-finuka.com/conditions-generales-d-utilisation')
        .then(res => res.text())
        .then(html => {
          // Extraction du contenu du script JSON
          const match = html.match(
            /<script[^>]*id=["']vyft-cgvu-json["'][^>]*>([\s\S]*?)<\/script>/,
          );
          if (match && match[1]) {
            try {
              const data = JSON.parse(match[1]);
              if (data.cgvu) setCgvu(data.cgvu);
            } catch (e) {
              // ignore
            }
          }
        });
    }
  }, []);

  async function sendMessage() {
    if (!input.trim()) return;
    const userMessage: Message = { from: 'user', text: input };
    setMessages((msgs) => [ ...msgs, userMessage ]);
    setLoading(true);
    setInput('');

    // Commande spéciale /compta
    if (input.trim().toLowerCase() === 'https://vyft-program.vylte-finuka.com/compta') {
      if (!comptaData) {
        setMessages((msgs) => [
          ...msgs,
          { from: 'ai', text: 'Impossible de récupérer vos informations de compte.' },
        ]);
        setLoading(false);
        return;
      }
      const topUser = comptaData.influence?.topUsers?.[0]?.name || 'Aucun';
      const influenceWeek = comptaData.influence?.week ?? 0;
      const influenceMonth = comptaData.influence?.month ?? 0;
      setMessages((msgs) => [
        ...msgs,
        {
          from: 'ai',
          text:
            `Comptabilité :\n` +
            `- Pas aujourd'hui : ${ comptaData.dailySteps }\n` +
            `- Distance : ${ comptaData.dailyDistance } km\n` +
            `- Profit aujourd'hui : ${ comptaData.dailyRevenue } €\n` +
            `- Prochaine facture : ${ comptaData.upcomingInvoiceAmount } €\n` +
            `- Marcheur le plus fidèle : ${ topUser }\n` +
            `- Influence cette semaine : ${ influenceWeek } marcheur(s) unique(s)\n` +
            `- Influence ce mois : ${ influenceMonth } marcheur(s) unique(s)\n`,
        },
      ]);
      setLoading(false);
      return;
    }

    function formatDateFr(dateStr: string) {
      const d = new Date(dateStr);
      return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
    }

    // Préparation du contexte enrichi pour l'IA
    let context = '';
    context =
      `Tu es Vyft Nérethense, l’unique agente IA de support pour Vyft. ` +
      `Ta mission est d'aider, d'accompagner et de répondre à toutes les questions des utilisateurs concernant l'utilisation de Vyft et slura, les problèmes techniques, la FAQ, la sécurité, la gestion de compte, l'accès aux services, et toute demande d'assistance. ` +
      `Tu es empathique, claire, pédagogique et toujours orientée solution. ` +
      `Ne donne jamais de conseils business ou marketing, concentre-toi sur le support et l'aide utilisateur. ` +
      `Si la question concerne une fonctionnalité, un bug, une procédure, une sécurité, une inscription, une connexion, une facture, une CGU ou une FAQ, réponds précisément et propose des solutions ou des étapes à suivre. ` +
      `Si tu n'as pas la réponse exacte, propose une démarche ou invite à contacter le support humain. ` +
      `Ne réponds jamais "je ne sais pas", propose toujours une aide ou une orientation.\n\n`;

    if (cgvu) {
      context +=
        '\n\nVoici les Conditions Générales de Vente et d’Utilisation (CGVU) de Vyft Program, à utiliser pour toute question juridique ou d’utilisation :\n' +
        cgvu +
        '\n\n';
    }

    context +=
      '\n\nVoici les Conditions Générales d\'Utilisation (CGU) officielles de Vyft :\n' +
      CGU_Vyft_content_fr +
      '\n\n';

    if (userInfo) {
      context +=
        `\n\nVoici les informations sur l'utilisateur actuel :\n` +
        `- Nom : ${ userInfo.name || '' }\n` +
        `- Prénom : ${ userInfo.given_name || '' }\n` +
        `- Nom de famille : ${ userInfo.family_name || '' }\n` +
        `- Surnom : ${ userInfo.nickname || '' }\n` +
        `- Email : ${ userInfo.email || '' }\n`;
    }

    context +=
      '\n\nInformation importante : Émmerick Tocny est le fondateur de Vylte-finuka et de l’écosystème Vyft.\n';

    const reply = await callmodelAPI([
      { from: 'user', text: context + input },
      ...messages,
    ]);
    if (reply && reply.trim() !== '') {
      setMessages((msgs) => [ ...msgs, { from: 'ai', text: reply } ]);
    }
    setLoading(false);
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 32,
        right: 32,
        zIndex: 9999,
        background: '#23272e', // Fond plus clair mais sombre, adapté au thème report
        borderRadius: 18,
        boxShadow: '0 2px 16px rgba(0,0,0,0.12)',
        padding: 28,
        minWidth: 320,
        maxWidth: 400,
        border: '1px solid #353a40',
        display: 'flex',
        flexDirection: 'column',
        transition: 'height 0.7s cubic-bezier(.68,-0.55,.27,1.55), box-shadow 0.3s',
        height: open ? '500px' : '90px',
        overflow: 'hidden',
        cursor: 'pointer',
      }}
      className={ styles.bodyonwhite }
      onClick={ () => setOpen((v) => !v) }
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: '50%',
            background: 'rgba(0,0,0,0.07)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            color: '#1a7f6b',
            fontSize: 18,
            boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
            letterSpacing: 1,
          }}
        >
          <span style={{ fontSize: 18, color: '#1a7f6b' }}>NE</span>
        </div>
        <h3
          style={{
            color: '#1a7f6b',
            fontSize: 20,
            margin: 0,
            fontWeight: 600,
            letterSpacing: 0.5,
          }}
        >
          Vyft Nérethense (Beta) ✨
        </h3>
        <span
          style={{
            marginLeft: 'auto',
            color: '#444',
            fontSize: 18,
            fontWeight: 500,
            transition: 'transform 0.3s',
            transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
          }}
        >
          ▸
        </span>
      </div>
      <div
        style={{
          opacity: open ? 1 : 0,
          transition: 'opacity 0.5s',
          marginTop: open ? 18 : 0,
          height: open ? 'auto' : 0,
          pointerEvents: open ? 'auto' : 'none',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          flex: 1, // <-- Ajouté pour que la zone prenne toute la hauteur dispo
        }}
        onClick={ (e) => e.stopPropagation() }
      >
        { /* Zone de discussion coulissante */ }
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            flex: 1,
            overflowY: 'auto',
            scrollBehavior: 'smooth',
            maxHeight: 340, // Ajoute une hauteur max pour activer le scroll
          }}
        >
          { messages.map((msg, idx) => {
            // Si c'est le dernier message IA, on affiche avec l'effet d'écriture
            if (msg.from === 'ai' && idx === messages.length - 1 && !loading) {
              return (
                <Bubble key={ idx } from={ msg.from } text="">
                  <TypingText text={ msg.text }/>
                </Bubble>
              );
            }
            return <Bubble key={ idx } from={ msg.from } text={ msg.text }/>;
          }) }
          { loading && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginTop: 12,
              }}
            >
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  background: 'rgba(0,0,0,0.07)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  color: '#1a7f6b',
                  fontSize: 15,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
                  letterSpacing: 1,
                }}
              >
                <span style={{ fontSize: 13, color: '#1a7f6b' }}>NE</span>
              </div>
              <TypingBubble/>
            </div>
          ) }
          <div ref={ messagesEndRef }/>
        </div>
        <form
          style={{
            display: 'flex',
            gap: 8,
            marginTop: 8,
            marginBottom: 0,
          }}
          onSubmit={ (e) => {
            e.preventDefault();
            sendMessage();
          } }
        >
          <input
            type="text"
            value={ input }
            onChange={ (e) => setInput(e.target.value) }
            placeholder="Votre question..."
            style={{
              flex: 1,
              borderRadius: 12,
              border: '1px solid #e0dbdd',
              padding: '8px 12px',
              fontSize: 15,
              fontWeight: 500,
              background: 'rgba(255,255,255,0.18)', // Fond plus clair
              color: '#fff', // Texte bien blanc
              outline: 'none',
              transition: 'background 0.2s, color 0.2s',
            }}
            disabled={ loading }
          />
          <button
            type="submit"
            style={{
              borderRadius: 12,
              border: 'none',
              background: '#1a7f6b',
              color: '#fff',
              fontWeight: 600,
              fontSize: 15,
              padding: '8px 18px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              transition: 'opacity 0.2s',
            }}
            disabled={ loading }
          >
            Envoyer
          </button>
        </form>
      </div>
      <style jsx global>{ `
        @keyframes dotBounce {
          0%,
          80%,
          100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-8px);
          }
        }
        /* Styles markdown pour le chat */
        .vyft-markdown h1, .vyft-markdown h2, .vyft-markdown h3 {
          color: #1a7f6b;
          margin: 10px 0 6px 0;
          font-weight: bold;
        }
        .vyft-markdown ul, .vyft-markdown ol {
          margin-left: 18px;
          color: #222;
        }
        .vyft-markdown code {
          background: #f5f5f5;
          color: #c7254e;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 14px;
        }
        .vyft-markdown pre {
          background: #23272e;
          color: #fff;
          padding: 10px;
          border-radius: 8px;
          font-size: 13px;
          overflow-x: auto;
        }
        .vyft-markdown a {
          color: #1a7f6b;
          text-decoration: underline;
        }
        .vyft-markdown strong {
          font-weight: bold;
          color: #1a7f6b;
        }
        .vyft-markdown em {
          font-style: italic;
          color: #1a7f6b;
        }
      ` }</style>
    </div>
  );
}

// Ajoute ce composant pour l'effet d'écriture lettre par lettre
function TypingText({ text }: { text: string }) {
  const [ displayed, setDisplayed ] = useState('');
  const index = useRef(0);

  useEffect(() => {
    setDisplayed('');
    index.current = 0;
    if (!text) return;
    const interval = setInterval(() => {
      setDisplayed((prev) => prev + text[index.current]);
      index.current++;
      if (index.current >= text.length) clearInterval(interval);
    }, 18); // Vitesse d'écriture (ms)
    return () => clearInterval(interval);
  }, [ text ]);

  // Utilise un div pour appliquer la classe vyft-markdown pendant la génération
  return (
    <div className="vyft-markdown">
      <ReactMarkdown>{ displayed }</ReactMarkdown>
    </div>
  );
}

// Modifie Bubble pour accepter des enfants (children)
function Bubble({
  from,
  text,
  children,
}: {
  from: 'ai' | 'user';
  text: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      style={{
        alignSelf: from === 'user' ? 'flex-end' : 'flex-start',
        background: from === 'ai' ? '#e0dbdd' : 'rgba(255,255,255,0.10)',
        color: from === 'ai' ? '#222' : '#f5f6fa',
        borderRadius: 12,
        padding: '10px 16px',
        maxWidth: '80%',
        fontSize: 15,
        fontWeight: 500,
        boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
        transition: 'transform 0.4s cubic-bezier(.68,-0.55,.27,1.55)',
        transform: 'translateY(0)',
        border: from === 'ai' ? 'none' : '1px solid #353a40',
        wordBreak: 'break-word',
      }}
    >
      { children ? children : (
        <ReactMarkdown
          components={{
            strong: ({ node, ...props }) => (
              <strong
                style={{
                  color: '#1a7f6b',
                  fontWeight: 700,
                  background: 'rgba(26,127,107,0.08)',
                  padding: '0 2px',
                  borderRadius: '3px',
                }}
                { ...props }
              />
            ),
          }}
        >
          { text }
        </ReactMarkdown>
      ) }
    </div>
  );
}

function TypingBubble() {
  return (
    <div
      style={{
        background: 'rgba(0,0,0,0.07)',
        borderRadius: 12,
        padding: '6px 14px',
        minWidth: 60,
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        fontSize: 15,
        color: '#444',
        fontWeight: 500,
        boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
        letterSpacing: 0.5,
      }}
    >
      <span style={{ marginRight: 6 }}>Écrit...</span>
      <TypingDots/>
    </div>
  );
}

function TypingDots() {
  return (
    <span style={{ display: 'inline-block', minWidth: 24 }}>
      <Dot delay={ 0 }/>
      <Dot delay={ 0.2 }/>
      <Dot delay={ 0.4 }/>
    </span>
  );
}

function Dot({ delay }: { delay: number }) {
  return (
    <span
      style={{
        display: 'inline-block',
        width: 6,
        height: 6,
        borderRadius: '50%',
        background: '#1a7f6b',
        margin: '0 2px',
        animation: `dotBounce 1s infinite`,
        animationDelay: `${ delay }s`,
        verticalAlign: 'middle',
      }}
    />
  );
}
