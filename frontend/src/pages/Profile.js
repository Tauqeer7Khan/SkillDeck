import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Calendar, Award, Edit2, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    bio: '',
    experience: 'beginner',
    targetRole: '',
    targetCompany: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user?.profile) {
      setFormData({
        firstName: user.profile.firstName || '',
        lastName: user.profile.lastName || '',
        bio: user.profile.bio || '',
        experience: user.profile.experience || 'beginner',
        targetRole: user.profile.targetRole || '',
        targetCompany: user.profile.targetCompany || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const result = await updateProfile(formData);
      if (result.success) {
        setIsEditing(false);
      }
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (user?.profile) {
      setFormData({
        firstName: user.profile.firstName || '',
        lastName: user.profile.lastName || '',
        bio: user.profile.bio || '',
        experience: user.profile.experience || 'beginner',
        targetRole: user.profile.targetRole || '',
        targetCompany: user.profile.targetCompany || ''
      });
    }
    setIsEditing(false);
  };

  const experienceLevels = [
    { value: 'beginner', label: 'Beginner', description: 'Just starting with coding interviews' },
    { value: 'intermediate', label: 'Intermediate', description: 'Comfortable with basic DSA concepts' },
    { value: 'advanced', label: 'Advanced', description: 'Strong grasp of algorithms and data structures' },
    { value: 'expert', label: 'Expert', description: 'Ready for top-tier company interviews' }
  ];

  const getExperienceColor = (level) => {
    const colors = {
      beginner: 'bg-success-100 text-success-800',
      intermediate: 'bg-warning-100 text-warning-800',
      advanced: 'bg-primary-100 text-primary-800',
      expert: 'bg-error-100 text-error-800'
    };
    return colors[level] || colors.beginner;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Profile</h1>
          <p className="mt-2 text-muted-foreground">Manage your account information and preferences</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="btn btn-primary flex items-center"
            >
              <Edit2 className="h-4 w-4 mr-2" />
              Edit Profile
            </button>
          ) : (
            <div className="flex items-center space-x-3">
              <button
                onClick={handleCancel}
                className="btn btn-outline flex items-center"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="btn btn-primary flex items-center disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Overview */}
        <div className="lg:col-span-1 space-y-6">
          {/* User Card */}
          <div className="card">
            <div className="card-content text-center">
              <div className="mx-auto h-24 w-24 bg-primary rounded-full flex items-center justify-center mb-4 shadow-md ring-4 ring-primary/10">
                <span className="text-3xl font-bold text-white">
                  {user?.username?.charAt(0).toUpperCase()}
                </span>
              </div>
              <h2 className="text-xl font-bold text-foreground tracking-tight">{user?.username}</h2>
              <p className="text-muted-foreground">{user?.email}</p>

              <div className="mt-4 flex items-center justify-center">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getExperienceColor(formData.experience)}`}>
                  {formData.experience.charAt(0).toUpperCase() + formData.experience.slice(1)}
                </span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="card">
            <div className="card-header">
              <h3 className="font-semibold text-foreground">Statistics</h3>
            </div>
            <div className="card-content space-y-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-2xl font-bold text-primary">
                  {user?.stats?.totalQuestionsSolved || 0}
                </p>
                <p className="text-sm text-muted-foreground">Problems Solved</p>
              </div>

              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-2xl font-bold text-success">
                  {user?.stats?.averageScore || 0}%
                </p>
                <p className="text-sm text-muted-foreground">Average Score</p>
              </div>

              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-2xl font-bold text-warning">
                  {Math.round((user?.stats?.totalTimeSpent || 0) / 60)}h
                </p>
                <p className="text-sm text-muted-foreground">Time Spent</p>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="card-header">
              <h3 className="font-semibold text-foreground">Profile Information</h3>
            </div>
            <div className="card-content">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h4 className="font-medium text-foreground">Personal Information</h4>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="input disabled:bg-muted"
                      placeholder="Enter your first name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="input disabled:bg-muted"
                      placeholder="Enter your last name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Bio
                    </label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      disabled={!isEditing}
                      rows={4}
                      className="input disabled:bg-muted resize-none"
                      placeholder="Tell us about yourself..."
                    />
                  </div>
                </div>

                {/* Career Information */}
                <div className="space-y-4">
                  <h4 className="font-medium text-foreground">Career Information</h4>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Experience Level
                    </label>
                    <select
                      name="experience"
                      value={formData.experience}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="input disabled:bg-muted"
                    >
                      {experienceLevels.map(level => (
                        <option key={level.value} value={level.value}>
                          {level.label}
                        </option>
                      ))}
                    </select>
                    {isEditing && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {experienceLevels.find(l => l.value === formData.experience)?.description}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Target Role
                    </label>
                    <input
                      type="text"
                      name="targetRole"
                      value={formData.targetRole}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="input disabled:bg-muted"
                      placeholder="e.g., Software Engineer"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Target Company
                    </label>
                    <input
                      type="text"
                      name="targetCompany"
                      value={formData.targetCompany}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="input disabled:bg-muted"
                      placeholder="e.g., Google, Microsoft"
                    />
                  </div>
                </div>
              </div>

              {/* Account Information */}
              <div className="mt-8 pt-6 border-t border-border">
                <h4 className="font-medium text-foreground mb-4">Account Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center space-x-3">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Username</p>
                      <p className="font-medium text-foreground">{user?.username}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium text-foreground">{user?.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Member Since</p>
                      <p className="font-medium text-foreground">
                        {new Date(user?.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Award className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Account Type</p>
                      <p className="font-medium capitalize text-foreground">{user?.role}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
