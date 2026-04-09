<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ThreadRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'subject'        => 'required|string|max:255',
            'participants'   => 'required|array|min:1',
            'participants.*' => 'exists:users,id',
            'body'           => 'required|string',
        ];
    }
}
