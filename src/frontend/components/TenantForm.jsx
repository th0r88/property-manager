import React, { useState, useEffect } from 'react';
import { useTranslation } from '../hooks/useTranslation';

export default function TenantForm({ onSubmit, initialData = {}, onCancel, selectedProperty }) {
    const { t } = useTranslation();
    const [capacityWarning, setCapacityWarning] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        surname: '',
        address: '',
        emso: '',
        tax_number: '',
        rent_amount: '',
        lease_duration: '',
        room_area: '',
        move_in_date: new Date().toISOString().split('T')[0],
        move_out_date: '',
        occupancy_status: 'active'
    });

    useEffect(() => {
        if (initialData && initialData.id) {
            setFormData({
                ...initialData,
                move_in_date: initialData.move_in_date || new Date().toISOString().split('T')[0],
                move_out_date: initialData.move_out_date || '',
                occupancy_status: initialData.occupancy_status || 'active'
            });
        } else {
            setFormData({
                name: '',
                surname: '',
                address: '',
                emso: '',
                tax_number: '',
                rent_amount: '',
                lease_duration: '',
                room_area: '',
                move_in_date: new Date().toISOString().split('T')[0],
                move_out_date: '',
                occupancy_status: 'active'
            });
        }
    }, [initialData]);

    useEffect(() => {
        if (selectedProperty && !initialData?.id) {
            checkCapacity();
        }
    }, [selectedProperty, initialData]);

    const validateDates = () => {
        const moveIn = new Date(formData.move_in_date);
        const moveOut = formData.move_out_date ? new Date(formData.move_out_date) : null;
        
        if (moveOut && moveIn >= moveOut) {
            return t('tenants.validation.moveOutAfterMoveIn');
        }
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (moveIn > today && !initialData?.id) {
            return t('tenants.validation.moveInNotFuture');
        }
        
        return null;
    };

    const checkCapacity = () => {
        if (!selectedProperty) {
            setCapacityWarning('');
            return;
        }

        const currentCount = selectedProperty.current_tenant_count || 0;
        const maxCapacity = selectedProperty.number_of_tenants;

        if (maxCapacity === null) {
            setCapacityWarning('');
            return;
        }

        if (currentCount >= maxCapacity) {
            setCapacityWarning(t('tenants.capacity.atCapacity', { current: currentCount, max: maxCapacity }));
        } else if (currentCount / maxCapacity > 0.8) {
            setCapacityWarning(t('tenants.capacity.nearCapacity', { current: currentCount, max: maxCapacity, remaining: maxCapacity - currentCount }));
        } else {
            setCapacityWarning('');
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const submissionData = {
            ...formData,
            property_id: selectedProperty?.id || 1
        };
        onSubmit(submissionData);
        if (!initialData?.id) {
            setFormData({
                name: '',
                surname: '',
                address: '',
                emso: '',
                tax_number: '',
                rent_amount: '',
                lease_duration: '',
                room_area: ''
            });
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCancel = () => {
        if (onCancel) onCancel();
        setFormData({
            name: '',
            surname: '',
            address: '',
            emso: '',
            tax_number: '',
            rent_amount: '',
            lease_duration: '',
            room_area: ''
        });
    };

    return (
        <div className="card bg-base-100 shadow-xl mb-6">
            <div className="card-body">
                <h2 className="card-title">{initialData?.id ? t('tenants.editTenant') : t('tenants.addTenant')}</h2>
                
                {selectedProperty && (
                    <div className="mb-4 p-3 bg-base-200 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                            <span className="font-semibold">{t('tenants.capacity.selectedProperty')}</span>
                            <span className="text-sm">{selectedProperty.name}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="font-semibold">{t('tenants.capacity.capacity')}</span>
                            <span className={`text-sm font-medium ${
                                selectedProperty.capacity_status === 'at_capacity' ? 'text-error' :
                                selectedProperty.capacity_status === 'near_capacity' ? 'text-warning' :
                                selectedProperty.capacity_status === 'unlimited' ? 'text-info' : 'text-success'
                            }`}>
                                {selectedProperty.number_of_tenants === null ? 
                                    `${selectedProperty.current_tenant_count || 0} ${t('tenants.capacity.unlimited')}` :
                                    `${selectedProperty.current_tenant_count || 0}/${selectedProperty.number_of_tenants}`
                                }
                            </span>
                        </div>
                        {selectedProperty.number_of_tenants !== null && (
                            <div className="w-full bg-base-300 rounded-full h-2 mt-2">
                                <div 
                                    className={`h-2 rounded-full transition-all duration-300 ${
                                        selectedProperty.capacity_status === 'at_capacity' ? 'bg-error' :
                                        selectedProperty.capacity_status === 'near_capacity' ? 'bg-warning' : 'bg-success'
                                    }`}
                                    style={{ 
                                        width: `${Math.min(100, ((selectedProperty.current_tenant_count || 0) / selectedProperty.number_of_tenants) * 100)}%` 
                                    }}
                                ></div>
                            </div>
                        )}
                    </div>
                )}
                
                {capacityWarning && (
                    <div className={`alert mb-4 ${
                        selectedProperty?.capacity_status === 'at_capacity' ? 'alert-error' : 'alert-warning'
                    }`}>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L5.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        {capacityWarning}
                    </div>
                )}
                
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 justify-items-end">
                        <div className="form-control w-full">
                            <label className="label">
                                <span className="label-text text-right">{t('tenants.form.nameRequired')}</span>
                            </label>
                            <input 
                                name="name" 
                                value={formData.name} 
                                onChange={handleChange} 
                                className="input input-bordered w-full" 
                                required 
                            />
                        </div>
                        <div className="form-control w-full">
                            <label className="label">
                                <span className="label-text text-right">{t('tenants.form.surnameRequired')}</span>
                            </label>
                            <input 
                                name="surname" 
                                value={formData.surname} 
                                onChange={handleChange} 
                                className="input input-bordered w-full" 
                                required 
                            />
                        </div>
                        <div className="form-control w-full">
                            <label className="label">
                                <span className="label-text text-right">{t('tenants.form.addressRequired')}</span>
                            </label>
                            <input 
                                name="address" 
                                value={formData.address} 
                                onChange={handleChange} 
                                className="input input-bordered w-full" 
                                required 
                            />
                        </div>
                        <div className="form-control w-full">
                            <label className="label">
                                <span className="label-text text-right">{t('tenants.form.emsoRequired')}</span>
                            </label>
                            <input 
                                name="emso" 
                                value={formData.emso} 
                                onChange={handleChange} 
                                className="input input-bordered w-full" 
                                required 
                            />
                        </div>
                        <div className="form-control w-full">
                            <label className="label">
                                <span className="label-text text-right">{t('tenants.form.taxNumberRequired')}</span>
                            </label>
                            <input 
                                name="tax_number" 
                                value={formData.tax_number} 
                                onChange={handleChange} 
                                className="input input-bordered w-full" 
                                required
                            />
                        </div>
                        <div className="form-control w-full">
                            <label className="label">
                                <span className="label-text text-right">{t('tenants.rentAmount')} (€) *</span>
                            </label>
                            <input 
                                name="rent_amount" 
                                type="number" 
                                step="any" 
                                value={formData.rent_amount} 
                                onChange={handleChange} 
                                className="input input-bordered w-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                                required 
                            />
                        </div>
                        <div className="form-control w-full">
                            <label className="label">
                                <span className="label-text text-right">{t('tenants.form.leaseDurationRequired')}</span>
                            </label>
                            <input 
                                name="lease_duration" 
                                type="number" 
                                value={formData.lease_duration} 
                                onChange={handleChange} 
                                className="input input-bordered w-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                                required 
                            />
                        </div>
                        <div className="form-control w-full">
                            <label className="label">
                                <span className="label-text text-right">{t('tenants.form.roomAreaRequired')}</span>
                            </label>
                            <input 
                                name="room_area" 
                                type="number" 
                                step="any" 
                                value={formData.room_area} 
                                onChange={handleChange} 
                                className="input input-bordered w-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                                required 
                            />
                        </div>
                        <div className="form-control w-full">
                            <label className="label">
                                <span className="label-text text-right">{t('tenants.form.moveInDateRequired')}</span>
                            </label>
                            <input 
                                name="move_in_date" 
                                type="date"
                                value={formData.move_in_date} 
                                onChange={handleChange} 
                                className="input input-bordered w-full" 
                                required 
                            />
                        </div>
                        <div className="form-control w-full">
                            <label className="label">
                                <span className="label-text text-right">{t('tenants.form.moveOutDateOptional')}</span>
                            </label>
                            <input 
                                name="move_out_date" 
                                type="date"
                                value={formData.move_out_date} 
                                onChange={handleChange} 
                                className="input input-bordered w-full" 
                            />
                        </div>
                        <div className="form-control w-full">
                            <label className="label">
                                <span className="label-text text-right">{t('tenants.form.occupancyStatusRequired')}</span>
                            </label>
                            <select
                                name="occupancy_status"
                                value={formData.occupancy_status}
                                onChange={handleChange}
                                className="select select-bordered w-full"
                                required
                            >
                                <option value="active">{t('tenants.occupancyStatuses.active')}</option>
                                <option value="pending">{t('tenants.occupancyStatuses.pending')}</option>
                                <option value="moved_out">{t('tenants.occupancyStatuses.moved_out')}</option>
                            </select>
                        </div>
                    </div>
                    
                    {/* Date Validation Warning */}
                    {validateDates() && (
                        <div className="alert alert-warning mt-4">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L5.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                            {validateDates()}
                        </div>
                    )}
                    
                    <div className="card-actions justify-end mt-6">
                        {initialData?.id && (
                            <button type="button" className="btn btn-ghost" onClick={handleCancel}>
                                {t('common.cancel')}
                            </button>
                        )}
                        <button 
                            type="submit" 
                            className="btn btn-primary"
                            disabled={
                                (!initialData?.id && selectedProperty?.capacity_status === 'at_capacity') ||
                                validateDates() !== null
                            }
                        >
                            {initialData?.id ? t('tenants.form.updateTenant') : t('tenants.form.addTenant')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}