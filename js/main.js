/* =========================================================
   전체 진행 순서
   ========================================================= */
(async function main() {
  await sUnlock();
  await sBoot();
  while (true) {
    await sTitle();
    await sBeginning();
    await sParty();
    await sMap();
    await sMemories();
    await sDistance();
    await sCall();
    await sReplay();
    await sQuests();
    const pick = await sFinal();
    if (pick === 0) await sEndingA(); else await sEndingB();
    await sCredits();
  }
})();
