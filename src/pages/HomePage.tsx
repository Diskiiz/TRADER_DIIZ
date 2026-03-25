import { useState, useEffect } from 'react';
import { Button, Select, RadioButton, RadioGroup, TextArea, TextField } from '@serendie/ui';
import { mockStocks } from '../data/mockStocks';
import { addDecision } from '../utils/storage';
import { loadAntennas } from '../utils/antennaStorage';
import { getPriceOnDate } from '../utils/priceSimulator';
import type { Action, Reason, Antenna } from '../types';

const REASONS: Reason[] = [
  '上がりそう', '下がりそう', '割安だと思う',
  'ニュースが気になる', '業績が良さそう', 'チャートが強そう', 'なんとなく',
];

const ACTIONS: { value: Action; label: string }[] = [
  { value: 'BUY',  label: '買い (BUY)'    },
  { value: 'SELL', label: '売り (SELL)'   },
  { value: 'HOLD', label: '様子見 (HOLD)' },
];

const STOCK_ITEMS = mockStocks.map(s => ({
  value: s.code,
  label: `${s.code}  ${s.name}`,
}));

const DEFAULT_SHARES = 100;

const HomePage = () => {
  const [selectedCode, setSelectedCode] = useState<string>(mockStocks[0].code);
  const [action, setAction] = useState<Action>('BUY');
  const [reason, setReason] = useState<Reason>(REASONS[0]);
  const [shares, setShares] = useState<number>(DEFAULT_SHARES);
  const [note, setNote] = useState('');
  const [saved, setSaved] = useState(false);

  const [activeAntennas, setActiveAntennas] = useState<Antenna[]>([]);
  const [selectedAntennaIds, setSelectedAntennaIds] = useState<string[]>([]);

  useEffect(() => {
    setActiveAntennas(loadAntennas().filter(a => a.isActive));
  }, []);

  const stock = mockStocks.find(s => s.code === selectedCode) ?? mockStocks[0];
  const today = new Date().toISOString().slice(0, 10);
  // 今日のシミュレート価格を取得
  const todayPrice = getPriceOnDate(stock.code, today);
  const estimatedAmount = action !== 'HOLD' ? shares * todayPrice : 0;

  const toggleAntennaSelection = (id: string) => {
    setSelectedAntennaIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSave = () => {
    const effectiveShares = action === 'HOLD' ? 0 : Math.max(0, shares);
    addDecision({
      id: Date.now().toString(),
      date: today,
      stockCode: stock.code,
      stockName: stock.name,
      action,
      reason,
      note,
      shares: effectiveShares,
      entryPrice: todayPrice,
      evaluationPrice: todayPrice,
      assumedAmount: effectiveShares * todayPrice,
      profitLoss: 0,
      result: 'NEUTRAL',
      antennaIds: selectedAntennaIds.length > 0 ? selectedAntennaIds : undefined,
    });
    setSaved(true);
    setNote('');
    setShares(DEFAULT_SHARES);
    setSelectedAntennaIds([]);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="home-page">
      {/* 銘柄選択 */}
      <section>
        <Select
          label="銘柄を選ぶ"
          items={STOCK_ITEMS}
          defaultValue={[mockStocks[0].code]}
          onValueChange={(details) => setSelectedCode(details.value[0])}
        />
        <div className="stock-info-card">
          <div className="stock-info-code">{stock.code}</div>
          <div className="stock-info-name">{stock.name}</div>
          <div className="stock-info-price">¥{todayPrice.toLocaleString()}</div>
          <div className="stock-info-meta">{stock.market} / {stock.sector}</div>
        </div>
      </section>

      {/* 判断の選択 */}
      <section>
        <p className="section-label">今日の判断</p>
        <div className="action-buttons">
          {ACTIONS.map(({ value, label }) => (
            <Button
              key={value}
              styleType={action === value ? 'filled' : 'outlined'}
              onClick={() => setAction(value)}
            >
              {label}
            </Button>
          ))}
        </div>
      </section>

      {/* 株数入力（HOLD 以外） */}
      {action !== 'HOLD' && (
        <section>
          <TextField
            label="株数"
            type="number"
            value={String(shares)}
            onChange={e => setShares(Math.max(1, parseInt(e.target.value) || 1))}
            min="1"
            step="100"
          />
          <div className="amount-estimate">
            想定金額：<strong>¥{estimatedAmount.toLocaleString()}</strong>
            <span className="amount-unit">（{shares.toLocaleString()} 株 × ¥{todayPrice.toLocaleString()}）</span>
          </div>
        </section>
      )}

      {/* 理由の選択 */}
      <section>
        <p className="section-label">判断の理由</p>
        <RadioGroup
          value={reason}
          onValueChange={(details) => setReason(details.value as Reason)}
        >
          {REASONS.map(r => (
            <RadioButton key={r} value={r} label={r} />
          ))}
        </RadioGroup>
      </section>

      {/* メモ */}
      <section>
        <TextArea
          label="メモ（任意）"
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="一言メモを残せます"
          fullWidth
        />
      </section>

      {/* 参考にしたアンテナ */}
      {activeAntennas.length > 0 && (
        <section>
          <p className="section-label">参考にしたアンテナ（任意）</p>
          <p className="section-hint">このニュースを見て判断した場合、選ぶと後で分析できます。</p>
          <div className="antenna-select-tags">
            {activeAntennas.map(ant => (
              <button
                key={ant.id}
                className={`antenna-select-tag ${selectedAntennaIds.includes(ant.id) ? 'is-selected' : ''}`}
                onClick={() => toggleAntennaSelection(ant.id)}
              >
                {ant.label}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* 保存 */}
      <section className="save-section">
        <Button
          styleType="filled"
          onClick={handleSave}
          disabled={saved}
        >
          {saved ? '記録しました！' : '判断を記録する'}
        </Button>
      </section>
    </div>
  );
};

export default HomePage;
