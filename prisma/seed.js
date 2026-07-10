const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // --- Administrador ---
  const adminCount = await prisma.admin.count();
  if (adminCount === 0) {
    const hashed = await bcrypt.hash('admin1234', 10);
    await prisma.admin.create({ data: { username: 'admin', password: hashed } });
    console.log('Admin creado: admin / admin1234');
  }

  // --- Medios por defecto (cartel, cabeceras, normas) ---
  const media = [
    { key: 'cartel', path: '/images/cartel-oficial.png', type: 'image', label: 'Cartel oficial' },
    { key: 'header-clasificacion', path: '/images/clasificacion-header.jpg', type: 'image', label: 'Cabecera Clasificación' },
    { key: 'header-cross', path: '/images/cross-header.jpg', type: 'image', label: 'Cabecera Cross' },
    { key: 'header-voley', path: '/images/voley-header.jpg', type: 'image', label: 'Cabecera Vóley' },
    { key: 'header-crossfit', path: '/images/crossfit-header.jpg', type: 'image', label: 'Cabecera CrossFit' },
    { key: 'header-paellas', path: '/images/paellas-header.jpg', type: 'image', label: 'Cabecera Paellas' },
    { key: 'header-playstation', path: '/images/playstation-header.jpg', type: 'image', label: 'Cabecera PlayStation' },
    { key: 'header-normas', path: '/images/normas-header.svg', type: 'image', label: 'Cabecera Normas' },
    { key: 'norma-generales', path: '/uploads/normas-generales.pdf', type: 'pdf', label: 'Normas Generales' },
    { key: 'norma-cross', path: '/uploads/normas-cross.pdf', type: 'pdf', label: 'Normas Cross' },
    { key: 'norma-voley', path: '/uploads/normas-voley.pdf', type: 'pdf', label: 'Normas Vóley' },
    { key: 'norma-crossfit', path: '/uploads/normas-crossfit.pdf', type: 'pdf', label: 'Normas CrossFit' },
    { key: 'norma-paellas', path: '/uploads/normas-paellas.pdf', type: 'pdf', label: 'Normas Paellas' },
    { key: 'norma-playstation', path: '/uploads/normas-generales.pdf', type: 'pdf', label: 'Normas PlayStation' },
  ];
  for (const m of media) {
    await prisma.mediaAsset.upsert({ where: { key: m.key }, update: {}, create: m });
  }

  // --- Equipos participantes del Trofeo de Santiago ---
  const teamNames = [
    'CG + UCG + EAS',
    'UING',
    'UTRANS',
    'ULOG',
    'GTLP 1',
    'GTLP 2',
    'UCIMIC + UGUCI + UABA',
    'TF-A',
  ];
  for (const name of teamNames) {
    await prisma.team.upsert({ where: { name }, update: {}, create: { name } });
  }

  // --- Calendario (fechas orientativas, editables desde el admin) ---
  if ((await prisma.activity.count()) === 0) {
    await prisma.activity.createMany({
      data: [
        { date: '2026-07-24', time: '09:00', name: 'Carrera de Cross', location: 'Circuito Base', description: 'Carrera individual y por equipos a través del circuito militar.' },
        { date: '2026-07-24', time: '12:00', name: 'Torneo de Vóley', location: 'Pabellón Central', description: 'Fase eliminatoria del torneo de voleibol.' },
        { date: '2026-07-25', time: '10:00', name: 'Desafío CrossFit', location: 'Zona de Entrenamiento', description: 'Pruebas funcionales por equipos.' },
        { date: '2026-07-25', time: '14:00', name: 'Concurso de Paellas', location: 'Explanada', description: 'Elaboración y cata de paellas por equipos.' },
        { date: '2026-07-25', time: '18:00', name: 'Torneo EA SPORTS FC', location: 'Sala de Ocio', description: 'Cuadro eliminatorio de PlayStation.' },
      ],
    });
  }

  // Las competiciones (Cross, Vóley, CrossFit, Paellas, PlayStation) empiezan
  // vacías: los resultados reales se introducen desde el panel de administración.

  // Recalcular totales de la clasificación general.
  const allTeams = await prisma.team.findMany({
    include: {
      crossResults: true,
      crossfitResult: true,
      paellaResult: true,
      volleyMatchA: true,
      volleyMatchB: true,
      psPlayers: true,
    },
  });
  for (const team of allTeams) {
    const total =
      team.crossResults.reduce((a, r) => a + (r.points || 0), 0) +
      (team.crossfitResult?.points || 0) +
      (team.paellaResult?.totalPoints || 0) +
      team.volleyMatchA.reduce((a, m) => a + (m.teamAPoints || 0), 0) +
      team.volleyMatchB.reduce((a, m) => a + (m.teamBPoints || 0), 0) +
      team.psPlayers.reduce((a, p) => a + (p.points || 0), 0) +
      (team.manualAdjust || 0);
    await prisma.team.update({ where: { id: team.id }, data: { totalPoints: total } });
  }

  console.log('Seed completado: 8 equipos participantes y competiciones vacías.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
