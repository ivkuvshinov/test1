'use client'

import { useState, useCallback } from 'react'
import { Calculator, FileText, Plus, Trash2, Copy, Check } from 'lucide-react'
import { numberToWords, formatCurrency } from '@/lib/numberToWords'

interface PaymentStage {
  id: string
  name: string
  percentage: number
  amount: number
  amountInWords: string
}

export default function Home() {
  const [totalAmount, setTotalAmount] = useState<number>(0)
  const [totalAmountInWords, setTotalAmountInWords] = useState<string>('')
  const [stages, setStages] = useState<PaymentStage[]>([
    { id: '1', name: 'Аванс', percentage: 30, amount: 0, amountInWords: '' },
    { id: '2', name: 'Промежуточный платёж', percentage: 40, amount: 0, amountInWords: '' },
    { id: '3', name: 'Окончательный расчёт', percentage: 30, amount: 0, amountInWords: '' },
  ])
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const calculateStages = useCallback((amount: number, currentStages: PaymentStage[]) => {
    return currentStages.map(stage => {
      const stageAmount = Math.round((amount * stage.percentage / 100) * 100) / 100
      return {
        ...stage,
        amount: stageAmount,
        amountInWords: numberToWords(stageAmount)
      }
    })
  }, [])

  const handleTotalAmountChange = (value: string) => {
    const numValue = parseFloat(value.replace(/[^\d.,]/g, '').replace(',', '.')) || 0
    setTotalAmount(numValue)
    setTotalAmountInWords(numberToWords(numValue))
    setStages(calculateStages(numValue, stages))
  }

  const handlePercentageChange = (id: string, percentage: number) => {
    const newStages = stages.map(stage =>
      stage.id === id ? { ...stage, percentage } : stage
    )
    setStages(calculateStages(totalAmount, newStages))
  }

  const handleNameChange = (id: string, name: string) => {
    setStages(stages.map(stage =>
      stage.id === id ? { ...stage, name } : stage
    ))
  }

  const addStage = () => {
    const newStage: PaymentStage = {
      id: Date.now().toString(),
      name: `Этап ${stages.length + 1}`,
      percentage: 0,
      amount: 0,
      amountInWords: ''
    }
    setStages([...stages, newStage])
  }

  const removeStage = (id: string) => {
    if (stages.length > 1) {
      const newStages = stages.filter(stage => stage.id !== id)
      setStages(calculateStages(totalAmount, newStages))
    }
  }

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const totalPercentage = stages.reduce((sum, stage) => sum + stage.percentage, 0)
  const totalStagesAmount = stages.reduce((sum, stage) => sum + stage.amount, 0)

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-full mb-4">
            <Calculator className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Калькулятор платежей по договорам
          </h1>
          <p className="text-gray-600">
            Автоматически расписывает суммы прописью и рассчитывает проценты по этапам оплат
          </p>
        </div>

        {/* Total Amount Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-6 h-6 text-indigo-600" />
            <h2 className="text-xl font-semibold text-gray-900">Общая сумма договора</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Сумма (в рублях)
              </label>
              <input
                type="text"
                value={totalAmount || ''}
                onChange={(e) => handleTotalAmountChange(e.target.value)}
                placeholder="Введите сумму договора"
                className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none"
              />
            </div>
            
            {totalAmount > 0 && (
              <div className="bg-indigo-50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-indigo-700">Сумма прописью:</span>
                  <button
                    onClick={() => copyToClipboard(`${formatCurrency(totalAmount)} (${totalAmountInWords})`, 'total')}
                    className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800 transition-colors"
                  >
                    {copiedId === 'total' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copiedId === 'total' ? 'Скопировано' : 'Копировать'}
                  </button>
                </div>
                <p className="text-gray-800 font-medium">
                  {formatCurrency(totalAmount)} ({totalAmountInWords})
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Payment Stages */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Этапы оплаты</h2>
            <button
              onClick={addStage}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Добавить этап
            </button>
          </div>

          {/* Percentage Warning */}
          {totalPercentage !== 100 && (
            <div className={`mb-4 p-3 rounded-lg ${totalPercentage > 100 ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
              ⚠️ Сумма процентов: {totalPercentage}% (должно быть 100%)
            </div>
          )}

          <div className="space-y-4">
            {stages.map((stage, index) => (
              <div key={stage.id} className="border-2 border-gray-100 rounded-xl p-4 hover:border-indigo-200 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold">
                    {index + 1}
                  </div>
                  
                  <div className="flex-grow space-y-3">
                    <div className="flex flex-wrap gap-3">
                      <div className="flex-grow min-w-[200px]">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Название этапа</label>
                        <input
                          type="text"
                          value={stage.name}
                          onChange={(e) => handleNameChange(stage.id, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 outline-none"
                        />
                      </div>
                      <div className="w-32">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Процент (%)</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={stage.percentage}
                          onChange={(e) => handlePercentageChange(stage.id, parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 outline-none"
                        />
                      </div>
                    </div>
                    
                    {totalAmount > 0 && stage.percentage > 0 && (
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-gray-600">Сумма этапа:</span>
                          <button
                            onClick={() => copyToClipboard(`${formatCurrency(stage.amount)} (${stage.amountInWords})`, stage.id)}
                            className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800"
                          >
                            {copiedId === stage.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                            {copiedId === stage.id ? 'Скопировано' : 'Копировать'}
                          </button>
                        </div>
                        <p className="text-gray-800 font-medium text-sm">
                          {formatCurrency(stage.amount)} ({stage.amountInWords})
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {stages.length > 1 && (
                    <button
                      onClick={() => removeStage(stage.id)}
                      className="flex-shrink-0 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        {totalAmount > 0 && (
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-xl p-6 text-white">
            <h2 className="text-xl font-semibold mb-4">Итого по договору</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white/10 rounded-xl p-4">
                <span className="text-indigo-200 text-sm">Общая сумма</span>
                <p className="text-2xl font-bold">{formatCurrency(totalAmount)}</p>
              </div>
              <div className="bg-white/10 rounded-xl p-4">
                <span className="text-indigo-200 text-sm">Сумма этапов</span>
                <p className="text-2xl font-bold">{formatCurrency(totalStagesAmount)}</p>
              </div>
            </div>
            
            {Math.abs(totalAmount - totalStagesAmount) > 0.01 && (
              <div className="mt-4 bg-white/10 rounded-xl p-4">
                <span className="text-yellow-300">⚠️ Разница: {formatCurrency(Math.abs(totalAmount - totalStagesAmount))}</span>
              </div>
            )}

            <div className="mt-4 bg-white/10 rounded-xl p-4">
              <h3 className="font-semibold mb-2">Текст для договора:</h3>
              <div className="text-sm space-y-1">
                {stages.filter(s => s.percentage > 0).map((stage, idx) => (
                  <p key={stage.id}>
                    {idx + 1}. {stage.name} — {stage.percentage}% от суммы договора, что составляет {formatCurrency(stage.amount)} ({stage.amountInWords}).
                  </p>
                ))}
              </div>
              <button
                onClick={() => {
                  const text = stages.filter(s => s.percentage > 0).map((stage, idx) => 
                    `${idx + 1}. ${stage.name} — ${stage.percentage}% от суммы договора, что составляет ${formatCurrency(stage.amount)} (${stage.amountInWords}).`
                  ).join('\n')
                  copyToClipboard(text, 'contract')
                }}
                className="mt-3 flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              >
                {copiedId === 'contract' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copiedId === 'contract' ? 'Скопировано!' : 'Скопировать текст'}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}