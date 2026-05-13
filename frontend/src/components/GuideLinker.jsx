import { useState, useEffect } from 'react';
import api from '../services/api';
import guideService from '../services/guideService';

// GuideLinker — admin component to link guides to a package or trek
// Props:
//   itemId       - package or trek _id
//   itemType     - 'package' | 'trek'
//   itemName     - display name for the item
//   onSave       - callback after successful save
//   initialGuides - already linked guide objects (populated from backend)

const S = `
.gl-root * { box-sizing: border-box; }
.gl-root { font-family: 'Roboto', sans-serif; }
.gl-info-box {
  background: #EEF4FB; border: 1px solid #93c5fd; border-radius: 10px;
  padding: 12px 14px; margin-bottom: 16px; font-size: 12px; color: #1B4F8A;
  display: flex; align-items: flex-start; gap: 8px; line-height: 1.5;
}
.gl-section-title {
  font-size: 11px; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.08em; color: #6b7280; margin-bottom: 10px;
}
.gl-search {
  width: 100%; padding: 9px 12px; border: 1.5px solid #d1fae5;
  border-radius: 9px; font-size: 13px; outline: none;
  font-family: inherit; margin-bottom: 12px;
}
.gl-search:focus { border-color: #16a34a; }

/* All guides list */
.gl-all-list { max-height: 260px; overflow-y: auto; border: 1.5px solid #e5f0e8; border-radius: 10px; margin-bottom: 16px; }
.gl-all-list::-webkit-scrollbar { width: 4px; }
.gl-all-list::-webkit-scrollbar-thumb { background: #d1fae5; border-radius: 2px; }
.gl-guide-row {
  display: grid; grid-template-columns: 36px 1fr auto;
  gap: 10px; align-items: center;
  padding: 10px 12px; border-bottom: 1px solid #f0fdf4;
  cursor: pointer; transition: background 0.12s;
}
.gl-guide-row:last-child { border-bottom: none; }
.gl-guide-row:hover { background: #fafff8; }
.gl-guide-row.linked { background: #f0fdf4; }
.gl-av {
  width: 36px; height: 36px; border-radius: 50%; flex-shrink: 0;
  background: linear-gradient(135deg, #0a2818, #16a34a);
  display: flex; align-items: center; justify-content: center;
  color: #fff; font-weight: 700; font-size: 13px; overflow: hidden;
}
.gl-av img { width: 100%; height: 100%; object-fit: cover; display: block; }
.gl-guide-name { font-size: 13px; font-weight: 600; color: #0a2818; }
.gl-guide-meta { font-size: 11px; color: #6b7280; margin-top: 1px;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.gl-check {
  width: 20px; height: 20px; border-radius: 50%; flex-shrink: 0;
  border: 2px solid #d1d5db; display: flex; align-items: center;
  justify-content: center; transition: all 0.15s;
}
.gl-check.on { background: #16a34a; border-color: #16a34a; color: #fff; font-size: 10px; font-weight: 800; }

/* Linked guides preview */
.gl-linked-list { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; min-height: 36px; }
.gl-linked-chip {
  display: flex; align-items: center; gap: 7px;
  background: #f0fdf4; border: 1.5px solid #d1fae5;
  border-radius: 20px; padding: 5px 10px 5px 6px;
  font-size: 12px; font-weight: 600; color: #0a2818;
}
.gl-chip-av {
  width: 24px; height: 24px; border-radius: 50%; flex-shrink: 0;
  background: linear-gradient(135deg, #0a2818, #16a34a);
  display: flex; align-items: center; justify-content: center;
  color: #fff; font-size: 10px; font-weight: 700; overflow: hidden;
}
.gl-chip-av img { width: 100%; height: 100%; object-fit: cover; }
.gl-chip-remove {
  width: 16px; height: 16px; border-radius: 50%; background: #fecaca;
  border: none; cursor: pointer; color: #b91c1c; font-size: 10px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; padding: 0; line-height: 1;
}
.gl-chip-remove:hover { background: #fca5a5; }
.gl-empty-linked {
  font-size: 12px; color: #9ca3af; font-style: italic;
  display: flex; align-items: center; gap: 6px;
}

.gl-save-btn {
  width: 100%; padding: 11px; background: #16a34a; color: #fff;
  border: none; border-radius: 10px; font-size: 13px; font-weight: 700;
  cursor: pointer; font-family: inherit; transition: background 0.15s;
}
.gl-save-btn:hover { background: #15803d; }
.gl-save-btn:disabled { background: #9ca3af; cursor: not-allowed; }
.gl-success {
  background: #f0fdf4; border: 1px solid #d1fae5; border-radius: 8px;
  padding: 10px 14px; font-size: 12px; color: #16a34a; font-weight: 600;
  margin-top: 10px; text-align: center;
}
.gl-loading { text-align: center; padding: 24px; color: #9ca3af; font-size: 13px; }
.gl-spin {
  width: 24px; height: 24px; border: 3px solid #d1fae5;
  border-top-color: #16a34a; border-radius: 50%;
  animation: glspin 0.8s linear infinite; margin: 0 auto 8px;
}
@keyframes glspin { to { transform: rotate(360deg); } }
`;

export default function GuideLinker({ itemId, itemType, itemName, onSave, initialGuides = [] }) {
  const [allGuides,    setAllGuides]    = useState([]);
  const [linkedIds,    setLinkedIds]    = useState(new Set(initialGuides.map(g => g._id || g)));
  const [linkedGuides, setLinkedGuides] = useState(initialGuides);
  const [search,       setSearch]       = useState('');
  const [loading,      setLoading]      = useState(true);
  const [saving,       setSaving]       = useState(false);
  const [saved,        setSaved]        = useState(false);

  useEffect(() => {
    guideService.getAvailableGuides().then(guides => {
      setAllGuides(guides);
      setLoading(false);
    });
  }, []);

  // When initialGuides changes (e.g. on re-edit) update state
  useEffect(() => {
    setLinkedIds(new Set(initialGuides.map(g => g._id?.toString() || g.toString())));
    setLinkedGuides(initialGuides);
  }, [JSON.stringify(initialGuides)]);

  const filtered = allGuides.filter(g => {
    if (!search) return true;
    const name  = `${g.firstName||''} ${g.lastName||''}`.toLowerCase();
    const specs = (g.specializations||[]).join(' ').toLowerCase();
    return name.includes(search.toLowerCase()) || specs.includes(search.toLowerCase());
  });

  const toggleGuide = (guide) => {
    const id = guide._id?.toString() || guide.toString();
    const newIds = new Set(linkedIds);
    if (newIds.has(id)) {
      newIds.delete(id);
      setLinkedGuides(prev => prev.filter(g => (g._id?.toString()||g.toString()) !== id));
    } else {
      newIds.add(id);
      setLinkedGuides(prev => [...prev, guide]);
    }
    setLinkedIds(newIds);
    setSaved(false);
  };

  const removeLinked = (id) => {
    const newIds = new Set(linkedIds);
    newIds.delete(id);
    setLinkedIds(newIds);
    setLinkedGuides(prev => prev.filter(g => (g._id?.toString()||g.toString()) !== id));
    setSaved(false);
  };

  const handleSave = async () => {
    if (!itemId) return;
    setSaving(true);
    setSaved(false);
    try {
      // Get userIds — the /guides endpoint returns userId for Guide-model entries
      const guideUserIds = allGuides
        .filter(g => linkedIds.has(g._id?.toString()))
        .map(g => g.userId?.toString() || g._id?.toString());

      const endpoint = itemType === 'package'
        ? `/packages/${itemId}/guides`
        : `/treks/${itemId}/guides`;

      await api.put(endpoint, { guideIds: guideUserIds });
      setSaved(true);
      if (onSave) onSave(Array.from(linkedIds));
    } catch (err) {
      console.error('GuideLinker save error:', err.response?.data || err.message);
    }
    setSaving(false);
  };

  return (
    <div className="gl-root">
      <style>{S}</style>

      <div className="gl-info-box">
        <span>ℹ️</span>
        <span>
          Link specific guides to <strong>{itemName || 'this ' + itemType}</strong>.
          Only these guides will appear when users book this {itemType}.
          Leave empty to show no guide option.
        </span>
      </div>

      {/* Linked guides chips */}
      <div className="gl-section-title">
        Linked Guides ({linkedIds.size})
      </div>
      <div className="gl-linked-list">
        {linkedGuides.length === 0 ? (
          <span className="gl-empty-linked">🧭 No guides linked yet — select from the list below</span>
        ) : (
          linkedGuides.map(g => {
            const id   = g._id?.toString() || g;
            const name = `${g.firstName||''} ${g.lastName||''}`.trim() || g.username || 'Guide';
            return (
              <div key={id} className="gl-linked-chip">
                <div className="gl-chip-av">
                  {g.profileImage
                    ? <img src={g.profileImage} alt="" onError={e => e.target.style.display='none'} />
                    : name.charAt(0).toUpperCase()
                  }
                </div>
                {name}
                <button className="gl-chip-remove" onClick={() => removeLinked(id)}>✕</button>
              </div>
            );
          })
        )}
      </div>

      {/* All guides list */}
      <div className="gl-section-title">All Available Guides</div>
      <input
        className="gl-search"
        placeholder="Search by name or specialty…"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      {loading ? (
        <div className="gl-loading"><div className="gl-spin" />Loading guides…</div>
      ) : (
        <div className="gl-all-list">
          {filtered.length === 0 && (
            <div style={{ padding:'20px', textAlign:'center', color:'#9ca3af', fontSize:13 }}>
              {search ? 'No guides match your search.' : 'No approved guides found.'}
            </div>
          )}
          {filtered.map(g => {
            const id      = g._id?.toString();
            const isOn    = linkedIds.has(id);
            const name    = `${g.firstName||''} ${g.lastName||''}`.trim() || g.username || 'Guide';
            const specs   = (g.specializations||[]).slice(0,2).join(', ') || 'General guide';
            const rate    = g.dailyRate;

            return (
              <div
                key={id}
                className={`gl-guide-row${isOn ? ' linked' : ''}`}
                onClick={() => toggleGuide(g)}
              >
                <div className="gl-av">
                  {g.profileImage
                    ? <img src={g.profileImage} alt="" onError={e => e.target.style.display='none'} />
                    : name.charAt(0).toUpperCase()
                  }
                </div>
                <div style={{ minWidth: 0 }}>
                  <div className="gl-guide-name">{name}</div>
                  <div className="gl-guide-meta">
                    {specs}
                    {g.rating > 0 && ` · ⭐ ${Number(g.rating).toFixed(1)}`}
                    {rate > 0 && ` · NPR ${Number(rate).toLocaleString()}/day`}
                  </div>
                </div>
                <div className={`gl-check${isOn ? ' on' : ''}`}>
                  {isOn ? '✓' : ''}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <button
        className="gl-save-btn"
        onClick={handleSave}
        disabled={saving || !itemId}
      >
        {saving ? '⏳ Saving…' : `Save Guide Assignments (${linkedIds.size} guide${linkedIds.size !== 1 ? 's' : ''})`}
      </button>

      {!itemId && (
        <div style={{ fontSize:11, color:'#f59e0b', marginTop:8, textAlign:'center' }}>
          ⚠️ Save the {itemType} first, then assign guides
        </div>
      )}

      {saved && (
        <div className="gl-success">
          ✓ Guides saved! Users will now see these {linkedIds.size} guide{linkedIds.size!==1?'s':''} when booking this {itemType}.
        </div>
      )}
    </div>
  );
}
