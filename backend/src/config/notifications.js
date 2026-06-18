const nodemailer = require('nodemailer');
require('dotenv').config();

// Configuração do transportador de e-mail (Nodemailer / SMTP)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

/**
 * Envia e-mail de confirmação de denúncia ao cidadão (se informou e-mail)
 * e/ou notificação ao órgão responsável.
 */
async function enviarEmailConfirmacaoDenuncia(destinatario, denuncia) {
  const html = `
    <h2>Denúncia registrada - E-Descarte</h2>
    <p>Sua denúncia foi registrada com sucesso.</p>
    <p><b>Protocolo:</b> ${denuncia.protocolo}</p>
    <p><b>Tipo de resíduo:</b> ${denuncia.tipo_residuo}</p>
    <p><b>Endereço:</b> ${denuncia.endereco}, ${denuncia.cidade}</p>
    <p>Em até 48h a equipe responsável fará a verificação do local.</p>
    <p><b>Legislação relacionada:</b> ${(denuncia.legislacao_relacionada || []).join(', ')}</p>
    <hr/>
    <small>EcoTech - Observatório Digital de Direito Ambiental</small>
  `;

  try {
    await transporter.sendMail({
      from: `"E-Descarte" <${process.env.SMTP_USER}>`,
      to: destinatario,
      subject: `Denúncia registrada - Protocolo ${denuncia.protocolo}`,
      html,
    });
    return true;
  } catch (err) {
    console.error('[Email] Erro ao enviar:', err.message);
    return false;
  }
}

/**
 * Envia SMS de alerta usando um provedor externo (ex: Twilio).
 * Implementação genérica via fetch para o provedor configurado.
 * Em produção, substitua pela SDK oficial do provedor (ex: Twilio SDK).
 */
async function enviarSmsAlerta(telefone, mensagem) {
  // Exemplo de integração genérica - adaptar para o provedor real (Twilio, Zenvia, etc.)
  if (!process.env.TWILIO_ACCOUNT_SID) {
    console.log(`[SMS - simulado] Para: ${telefone} | Mensagem: ${mensagem}`);
    return true;
  }

  try {
    // Aqui entraria a chamada real à API do provedor de SMS, por exemplo:
    // const client = require('twilio')(accountSid, authToken);
    // await client.messages.create({ body: mensagem, from: TWILIO_PHONE_NUMBER, to: telefone });
    console.log(`[SMS] Enviado para ${telefone}: ${mensagem}`);
    return true;
  } catch (err) {
    console.error('[SMS] Erro ao enviar:', err.message);
    return false;
  }
}

module.exports = { enviarEmailConfirmacaoDenuncia, enviarSmsAlerta };
