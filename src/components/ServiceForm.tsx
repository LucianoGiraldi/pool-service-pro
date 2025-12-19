import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { applyPhoneMask, applyCurrencyMask, parseCurrencyInput } from '@/lib/formatters';
import { sendWebhook, ServiceFormData } from '@/lib/webhook';
import { Loader2, CheckCircle2, AlertCircle, Send } from 'lucide-react';

const SERVICOS = [
  'Limpeza completa',
  'Tratamento químico',
  'Manutenção preventiva',
  'Troca de filtro',
  'Aspiração',
  'Análise de água',
  'Instalação de equipamento',
  'Reparo de bomba',
  'Outro',
];

type FormStatus = 'idle' | 'loading' | 'success' | 'error';

export function ServiceForm() {
  const { toast } = useToast();
  const [status, setStatus] = useState<FormStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const [servico, setServico] = useState('');
  const [outroServico, setOutroServico] = useState('');
  const [profissional, setProfissional] = useState('');
  const [telefone, setTelefone] = useState('');
  const [valor, setValor] = useState('');
  const [observacoes, setObservacoes] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    const finalServico = servico === 'Outro' ? outroServico.trim() : servico;
    if (!finalServico) {
      newErrors.servico = 'Selecione um serviço';
    }

    if (!profissional.trim()) {
      newErrors.profissional = 'Nome do profissional é obrigatório';
    }

    const phoneDigits = telefone.replace(/\D/g, '');
    if (phoneDigits.length < 10 || phoneDigits.length > 11) {
      newErrors.telefone = 'Telefone inválido (DDD + número)';
    }

    const valorNumerico = parseCurrencyInput(valor);
    if (valorNumerico <= 0) {
      newErrors.valor = 'Valor deve ser maior que zero';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setServico('');
    setOutroServico('');
    setProfissional('');
    setTelefone('');
    setValor('');
    setObservacoes('');
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: 'Campos inválidos',
        description: 'Verifique os campos destacados',
        variant: 'destructive',
      });
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    const formData: ServiceFormData = {
      servico: servico === 'Outro' ? outroServico.trim() : servico,
      profissional: profissional.trim(),
      telefone: telefone,
      valor: parseCurrencyInput(valor),
      observacoes: observacoes.trim(),
    };

    const result = await sendWebhook(formData);

    if (result.success) {
      setStatus('success');
      toast({
        title: 'Enviado com sucesso!',
        description: 'O relatório foi enviado para o WhatsApp',
      });
      resetForm();
      setTimeout(() => setStatus('idle'), 3000);
    } else {
      setStatus('error');
      setErrorMessage(result.error || 'Erro ao enviar');
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTelefone(applyPhoneMask(e.target.value));
  };

  const handleValorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValor(applyCurrencyMask(e.target.value));
  };

  if (status === 'success') {
    return (
      <div className="flex flex-col items-center justify-center py-12 animate-fade-in">
        <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mb-4">
          <CheckCircle2 className="w-10 h-10 text-success" />
        </div>
        <h3 className="text-xl font-semibold text-card-foreground mb-2">Enviado com sucesso!</h3>
        <p className="text-muted-foreground text-center">
          O relatório foi enviado para o WhatsApp do cliente e da Clean Pool.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 animate-fade-in">
      {/* Serviço */}
      <div className="space-y-2">
        <Label htmlFor="servico">Serviço prestado *</Label>
        <Select value={servico} onValueChange={setServico}>
          <SelectTrigger id="servico" className={errors.servico ? 'border-destructive' : ''}>
            <SelectValue placeholder="Selecione o serviço" />
          </SelectTrigger>
          <SelectContent>
            {SERVICOS.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {servico === 'Outro' && (
          <Input
            placeholder="Descreva o serviço"
            value={outroServico}
            onChange={(e) => setOutroServico(e.target.value)}
            className="mt-2"
          />
        )}
        {errors.servico && <p className="text-sm text-destructive">{errors.servico}</p>}
      </div>

      {/* Profissional */}
      <div className="space-y-2">
        <Label htmlFor="profissional">Nome do profissional *</Label>
        <Input
          id="profissional"
          placeholder="Ex: João Silva"
          value={profissional}
          onChange={(e) => setProfissional(e.target.value)}
          className={errors.profissional ? 'border-destructive' : ''}
        />
        {errors.profissional && <p className="text-sm text-destructive">{errors.profissional}</p>}
      </div>

      {/* Telefone */}
      <div className="space-y-2">
        <Label htmlFor="telefone">Telefone do cliente *</Label>
        <Input
          id="telefone"
          type="tel"
          placeholder="(44) 99112-2406"
          value={telefone}
          onChange={handlePhoneChange}
          className={errors.telefone ? 'border-destructive' : ''}
        />
        {errors.telefone && <p className="text-sm text-destructive">{errors.telefone}</p>}
      </div>

      {/* Valor */}
      <div className="space-y-2">
        <Label htmlFor="valor">Valor cobrado (R$) *</Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
            R$
          </span>
          <Input
            id="valor"
            type="text"
            inputMode="decimal"
            placeholder="199,90"
            value={valor}
            onChange={handleValorChange}
            className={`pl-10 ${errors.valor ? 'border-destructive' : ''}`}
          />
        </div>
        {errors.valor && <p className="text-sm text-destructive">{errors.valor}</p>}
      </div>

      {/* Observações */}
      <div className="space-y-2">
        <Label htmlFor="observacoes">Observações (opcional)</Label>
        <Textarea
          id="observacoes"
          placeholder="Detalhes adicionais sobre o serviço..."
          value={observacoes}
          onChange={(e) => setObservacoes(e.target.value)}
          rows={3}
        />
      </div>

      {/* Error state */}
      {status === 'error' && (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-destructive/10 text-destructive animate-fade-in">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-medium">Erro ao enviar</p>
            <p className="text-sm opacity-80">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Submit button */}
      <Button
        type="submit"
        className="w-full h-12 text-base font-semibold"
        disabled={status === 'loading'}
      >
        {status === 'loading' ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Enviando...
          </>
        ) : status === 'error' ? (
          'Tentar novamente'
        ) : (
          <>
            <Send className="w-5 h-5 mr-2" />
            Enviar
          </>
        )}
      </Button>
    </form>
  );
}
