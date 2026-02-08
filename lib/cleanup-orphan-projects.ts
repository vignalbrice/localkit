/**
 * Script pour nettoyer les projets orphelins du localStorage
 * À exécuter côté client si des erreurs de foreign key apparaissent
 */

export function cleanupOrphanProjects() {
  if (typeof window === 'undefined') return;

  try {
    const projects = localStorage.getItem('i18n-projects');
    if (projects) {
      console.log('🧹 Nettoyage des projets du localStorage...');
      localStorage.removeItem('i18n-projects');
      console.log('✅ Projets supprimés du localStorage');
    }

    const subscription = localStorage.getItem('i18n-subscription');
    if (subscription) {
      console.log('ℹ️  Plan conservé :', subscription);
    }
  } catch (error) {
    console.error('Erreur lors du nettoyage:', error);
  }
}

/**
 * Vérifie si un projet existe dans la base de données
 */
export async function validateProjectExists(projectId: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/projects/${projectId}`);
    return response.ok;
  } catch (error) {
    console.error('Erreur validation projet:', error);
    return false;
  }
}

/**
 * Nettoie automatiquement les projets invalides avant une opération
 */
export async function cleanupInvalidProjects() {
  if (typeof window === 'undefined') return;

  try {
    const projectsStr = localStorage.getItem('i18n-projects');
    if (!projectsStr) return;

    const projects = JSON.parse(projectsStr);
    const validProjects = [];

    for (const project of projects) {
      const isValid = await validateProjectExists(project.id);
      if (isValid) {
        validProjects.push(project);
      } else {
        console.warn(`⚠️  Projet orphelin supprimé: ${project.name} (${project.id})`);
      }
    }

    if (validProjects.length !== projects.length) {
      localStorage.setItem('i18n-projects', JSON.stringify(validProjects));
      console.log(`✅ ${projects.length - validProjects.length} projet(s) orphelin(s) nettoyé(s)`);
    }
  } catch (error) {
    console.error('Erreur nettoyage projets invalides:', error);
  }
}
