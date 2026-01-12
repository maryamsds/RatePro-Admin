import { useMemo } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { SURVEY_BUILDER_MODE } from '../constants/surveyBuilderConstants';

/**
 * Custom hook to detect and manage Survey Builder mode
 * Consolidates all mode detection logic into a single source of truth
 */
export const useSurveyMode = (user) => {
  const { id: surveyId } = useParams();
  const location = useLocation();
  const locationState = location.state || {};
  
  const mode = useMemo(() => {
    const templateData = locationState.templateData;
    const fromTemplates = locationState.source === 'templates';
    const isAdmin = user?.role === 'admin';
    
    // Priority 1: Admin creating new template
    if (locationState.createTemplate === true && isAdmin && !surveyId) {
      return {
        type: SURVEY_BUILDER_MODE.CREATE_TEMPLATE,
        isTemplateMode: true,
        isEditing: false,
        surveyId: null,
        templateData: null,
        canAccessWizard: false, // Templates use tabbed interface
        title: 'Create Survey Template',
        subtitle: 'Create a reusable survey template for tenants',
        badgeText: 'New Template',
        badgeVariant: 'success'
      };
    }
    
    // Priority 2: Admin editing existing template
    if (locationState.mode === 'template-edit' && isAdmin && surveyId) {
      return {
        type: SURVEY_BUILDER_MODE.EDIT_TEMPLATE,
        isTemplateMode: true,
        isEditing: true,
        surveyId,
        templateData,
        canAccessWizard: false,
        title: 'Update Survey Template',
        subtitle: 'Modify an existing survey template',
        badgeText: 'Update Template',
        badgeVariant: 'warning'
      };
    }
    
    // Priority 3: Creating survey from template (non-admin)
    if (fromTemplates && templateData && !isAdmin) {
      return {
        type: SURVEY_BUILDER_MODE.CREATE_FROM_TEMPLATE,
        isTemplateMode: false,
        isEditing: false,
        surveyId: null,
        templateData,
        canAccessWizard: true,
        title: 'Create Survey from Template',
        subtitle: `Using template: ${templateData?.name || 'Unknown'}`,
        badgeText: 'Template-based',
        badgeVariant: 'info'
      };
    }
    
    // Priority 4: Editing existing survey
    if (surveyId && !locationState.createTemplate && locationState.mode !== 'template-edit') {
      return {
        type: SURVEY_BUILDER_MODE.EDIT_SURVEY,
        isTemplateMode: false,
        isEditing: true,
        surveyId,
        templateData: null,
        canAccessWizard: true,
        title: 'Edit Survey',
        subtitle: 'Modify your existing survey',
        badgeText: 'Editing',
        badgeVariant: 'warning'
      };
    }
    
    // Default: Creating new survey from scratch
    return {
      type: SURVEY_BUILDER_MODE.CREATE_SURVEY,
      isTemplateMode: false,
      isEditing: false,
      surveyId: null,
      templateData: null,
      canAccessWizard: true,
      title: 'Create Survey',
      subtitle: 'Build a new survey from scratch or with AI assistance',
      badgeText: 'New Survey',
      badgeVariant: 'primary'
    };
  }, [surveyId, locationState, user?.role]);
  
  return mode;
};

export default useSurveyMode;